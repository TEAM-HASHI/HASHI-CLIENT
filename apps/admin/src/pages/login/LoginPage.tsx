import { HashiPointMarkIcon } from '@hashi/hds-icons'
import { Button, InputField } from '@hashi/hds-ui'
import { useMutation } from '@tanstack/react-query'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { authApi } from '@/shared/api/authApi'
import { setAdminSession } from '@/shared/auth/adminSession'

export const LoginPage = () => {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '관리자 로그인에 실패했습니다.',
      )
    },
    onSuccess: (session) => {
      setAdminSession(session)
      navigate(ROUTES.dashboard, { replace: true })
    },
  })

  const isSubmitDisabled =
    loginId.trim().length === 0 ||
    password.trim().length === 0 ||
    loginMutation.isPending

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    loginMutation.mutate({ loginId: loginId.trim(), password })
  }

  return (
    <main className="bg-cool-gray-50 flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="border-cool-gray-100 grid w-full max-w-[68rem] overflow-hidden rounded-lg border bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-cool-gray-900 hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-lg bg-white/10 text-white">
                <HashiPointMarkIcon aria-hidden="true" className="size-8" />
              </span>
              <div>
                <p className="text-2xl font-extrabold">HASHI Admin</p>
                <p className="text-cool-gray-200 text-sm font-semibold">
                  운영 데이터를 빠르게 확인하고 조치합니다.
                </p>
              </div>
            </div>
            <div className="mt-16 space-y-4">
              <p className="text-4xl leading-tight font-bold">
                예약, 식당, 매거진을 API 기준으로 관리하세요.
              </p>
              <p className="text-cool-gray-200 text-sm leading-6">
                관리자 계정으로 로그인하면 실제 운영 API에 연결됩니다.
              </p>
            </div>
          </div>
          <p className="text-cool-gray-300 text-xs font-semibold">
            HASHI-91 Admin Console
          </p>
        </div>

        <form
          className="flex flex-col gap-6 p-6 sm:p-10"
          onSubmit={handleSubmit}
        >
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="bg-primary-100 text-primary-200 flex size-11 items-center justify-center rounded-lg">
                <HashiPointMarkIcon aria-hidden="true" className="size-8" />
              </span>
              <div>
                <p className="text-primary-200 text-xl font-extrabold">
                  HASHI Admin
                </p>
                <p className="text-cool-gray-500 text-sm font-semibold">
                  관리자 콘솔
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-cool-gray-900 text-2xl font-bold">
              관리자 로그인
            </h1>
            <p className="text-cool-gray-500 mt-2 text-sm leading-6">
              발급받은 관리자 로그인 ID와 비밀번호를 입력하세요.
            </p>
          </div>

          <div className="space-y-4">
            <InputField
              label="로그인 ID"
              autoComplete="username"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
            />
            <InputField
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage ? (
            <p className="border-error/20 bg-error/10 text-error rounded-md border px-4 py-3 text-sm font-semibold">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            width="full"
            loading={loginMutation.isPending}
            disabled={isSubmitDisabled}
          >
            로그인
          </Button>
        </form>
      </section>
    </main>
  )
}
