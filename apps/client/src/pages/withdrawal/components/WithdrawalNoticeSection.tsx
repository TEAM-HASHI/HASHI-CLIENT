const withdrawalNotices = [
  '더 이상, 해당 계정으로 로그인할 수 없게 됩니다.',
  '사용자가 설정한 모든 정보가 영구적으로 사라지고 복구가 불가능 합니다.',
  '작성한 리뷰, 사진 등 모든 정보가 즉시 삭제됩니다. 중요한 정보가 있는 지 탈퇴 전에 확인하시고, 필요한 경우 저장, 수정 또는 삭제하세요.',
] as const

export const WithdrawalNoticeSection = () => {
  return (
    <section aria-labelledby="withdrawal-notice-heading">
      <h1 className="typo-header-2 text-black" id="withdrawal-notice-heading">
        회원 탈퇴 신청
      </h1>
      <p className="typo-body-3 mt-0.75 text-black">
        탈퇴하기 전에 아래 내용을 꼭 확인하세요
      </p>

      <ul className="mt-7.25 flex flex-col gap-3.75">
        {withdrawalNotices.map((notice) => (
          <li
            className="typo-body-8 text-cool-gray-700 bg-primary-100 rounded-[10px] px-4.25 py-3.25 break-keep"
            key={notice}
          >
            {notice}
          </li>
        ))}
      </ul>
    </section>
  )
}
