const withdrawalNotices = [
  '더 이상, 해당 계정으로 로그인할 수 없게 됩니다.',
  '개인 계정 정보는 복구할 수 없습니다.',
  '작성한 리뷰와 첨부 사진은 유지되며, 작성자 정보는 기본 프로필 이미지와 익명 닉네임으로 표시됩니다.',
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
