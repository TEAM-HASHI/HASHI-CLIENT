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
      <section className="border-cool-gray-100 grid w-full max-w-[68rem] overflow-hidden rounded-2xl border bg-white shadow-xl lg:min-h-[40rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-cool-gray-900 relative hidden overflow-hidden p-10 text-white lg:flex lg:items-center lg:justify-center">
          <span
            aria-hidden="true"
            className="bg-primary-200/20 absolute -top-24 -left-20 size-72 rounded-full blur-3xl"
          />
          <span
            aria-hidden="true"
            className="absolute -right-24 -bottom-28 size-80 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-8 text-center">
            <span
              role="img"
              aria-label="HASHI Admin 로고"
              className="flex size-40 items-center justify-center rounded-[2rem] bg-white/90 shadow-2xl ring-1 ring-white/20"
            >
              <HashiPointMarkIcon aria-hidden="true" className="size-28" />
            </span>
            <p className="text-4xl font-extrabold tracking-tight">
              HASHI Admin
            </p>
          </div>
        </div>

        <form
          className="flex flex-col justify-center gap-7 p-6 sm:p-12 lg:p-16"
          onSubmit={handleSubmit}
        >
          <div className="lg:hidden">
            <div className="flex flex-col items-center gap-4 text-center">
              <span
                role="img"
                aria-label="HASHI Admin 로고"
                className="bg-primary-100 flex size-20 items-center justify-center rounded-2xl shadow-lg"
              >
                <HashiPointMarkIcon aria-hidden="true" className="size-14" />
              </span>
              <p className="text-cool-gray-900 text-2xl font-extrabold tracking-tight">
                HASHI Admin
              </p>
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
