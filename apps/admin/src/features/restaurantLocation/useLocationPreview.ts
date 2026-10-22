import { useEffect, useRef, useState } from 'react'
import {
  restaurantLocationApi,
  type LocationPreviewInput,
  type PlaceCandidate,
} from '@/features/restaurantLocation/api/restaurantLocationApi'
import { locationErrorMessage } from '@/features/restaurantLocation/locationOptions'

export const useLocationPreview = () => {
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null)
  const [selected, setSelected] = useState<PlaceCandidate | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const clear = () => {
    controller.current?.abort()
    controller.current = null
    setBusy(false)
    setCandidates(null)
    setSelected(null)
    setError('')
  }
  const search = async (input: LocationPreviewInput) => {
    if (controller.current) return
    if (
      ![input.name, input.localName, input.address].every((value) =>
        value.trim(),
      ) ||
      input.name.length > 100 ||
      input.localName.length > 100 ||
      input.address.length > 255
    ) {
      setError('식당명·현지명은 100자, 주소는 255자 이내로 입력해주세요.')
      return
    }
    clear()
    const active = new AbortController()
    controller.current = active
    setBusy(true)
    try {
      const response = await restaurantLocationApi.preview(input, active.signal)
      if (!active.signal.aborted) setCandidates(response.candidates)
    } catch (cause) {
      if (!active.signal.aborted) setError(locationErrorMessage(cause))
    } finally {
      if (controller.current === active) controller.current = null
      if (!active.signal.aborted) setBusy(false)
    }
  }
  const select = (candidate: PlaceCandidate) => {
    if (!candidates?.includes(candidate)) return
    if (Date.parse(candidate.selectionExpiresAt) <= Date.now()) {
      setError('장소 후보가 만료되었습니다. 다시 검색해주세요.')
      return
    }
    setSelected(candidate)
    setError('')
  }
  const getToken = () => {
    if (busy) throw new Error('위치 미리보기 검색이 끝난 뒤 등록해주세요.')
    if (selected && Date.parse(selected.selectionExpiresAt) <= Date.now())
      throw new Error(
        '선택한 장소가 만료되었습니다. 다시 검색하거나 선택을 해제해주세요.',
      )
    return selected?.selectionToken
  }
  return { candidates, selected, busy, error, clear, search, select, getToken }
}
