import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { showToast } from '@hashi/hds-ui'
import { changeMagazineLike } from '@/pages/magazineDetail/api/magazineDetailApi'
import { magazineQueryKeys } from '@/features/magazine/queries/magazineQueryKeys'
import type { MagazineDetailResponse } from '@/pages/magazineDetail/api/magazineDetailApi'
import {
  getAuthSessionStatus,
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { captureError } from '@/shared/lib/sentry'

export const useMagazineLikeMutation = (magazineId: number, viewer: number) => {
  const client = useQueryClient()
  const queryKey = magazineQueryKeys.detail(magazineId, viewer)
  const locked = useRef(false)
  const active = useRef(false)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    active.current = true
    const unsubscribe = subscribeAuthSession(() => {
      if (getAuthSessionVersion() !== viewer) {
        active.current = false
        controller.current?.abort()
      }
    })
    return () => {
      active.current = false
      controller.current?.abort()
      unsubscribe()
    }
  }, [viewer])
  const isCurrent = () =>
    active.current &&
    getAuthSessionVersion() === viewer &&
    getAuthSessionStatus() === 'authenticated'
  const mutation = useMutation({
    retry: false,
    mutationFn: (liked: boolean) => {
      if (!isCurrent() || !controller.current)
        throw new Error('Magazine session changed')
      return changeMagazineLike(magazineId, liked, controller.current.signal)
    },
    onMutate: async (liked) => {
      await client.cancelQueries({ queryKey, exact: true })
      if (!isCurrent()) return
      const previous = client.getQueryData<MagazineDetailResponse>(queryKey)
      if (previous)
        client.setQueryData(queryKey, {
          ...previous,
          liked,
          likeCount: Math.max(0, previous.likeCount + (liked ? 1 : -1)),
        })
      return previous
    },
    onSuccess: (response) => {
      if (isCurrent())
        client.setQueryData<MagazineDetailResponse>(queryKey, (current) =>
          current ? { ...current, ...response } : undefined,
        )
    },
    onError: (error, _liked, previous) => {
      if (!isCurrent()) return
      if (previous && client.getQueryData(queryKey))
        client.setQueryData(queryKey, previous)
      captureError(error)
      showToast({ children: getErrorPresentation(error).message })
    },
    onSettled: () => {
      locked.current = false
      controller.current = null
      void client.invalidateQueries({ queryKey, exact: true })
    },
  })
  return {
    isPending: mutation.isPending,
    toggle: () => {
      if (locked.current || !isCurrent()) return
      const current = client.getQueryData<MagazineDetailResponse>(queryKey)
      if (!current) return
      locked.current = true
      controller.current = new AbortController()
      mutation.mutate(!current.liked)
    },
  }
}
