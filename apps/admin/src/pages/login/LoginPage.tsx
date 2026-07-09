import { HashiPointMarkIcon } from '@hashi/hds-icons'
import { Button, InputField } from '@hashi/hds-ui'
import { useMutation } from '@tanstack/react-query'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { adminService } from '@/shared/api/adminService'

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@hashi.kr')
  const [password, setPassword] = useState('hashi91!')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: adminService.login,
    onSuccess: () => {
      navigate(ROUTES.dashboard, { replace: true })
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '관리자 로그인에 실패했습니다.',
      )
    },
  })

  const isSubmitDisabled =
    email.trim().length === 0 ||
    password.trim().length === 0 ||
    loginMutation.isPending

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    loginMutation.mutate({ email, password })
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
                예약, 식당, 매거진을 한 화면에서 관리하세요.
              </p>
              <p className="text-cool-gray-200 text-sm leading-6">
                API 확정 전 mock adapter 기반으로 퍼블리싱과 인터랙션을 검증할
                수 있는 임시 관리자 콘솔입니다.
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
              기본 샘플 계정이 입력되어 있습니다. 실패 상태 확인은 비밀번호에
              `fail`을 입력하세요.
            </p>
          </div>

          <div className="space-y-4">
            <InputField
              label="이메일"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
