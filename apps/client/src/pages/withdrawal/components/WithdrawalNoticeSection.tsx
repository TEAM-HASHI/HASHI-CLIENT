const withdrawalNotices = [
  '탈퇴 후에는 해당 계정으로 로그인하거나 서비스를 이용할 수 없어요. 계정 정보는 복구할 수 없어요.',
  '작성한 리뷰와 사진은 유지되지만, 닉네임과 프로필 사진 등 작성자 정보는 익명으로 처리돼요.',
  '보유 포인트는 탈퇴와 동시에 모두 소멸되며, 복구하거나 환불받을 수 없어요.',
  '예약 결과 확인 중이거나 예약일시가 지나지 않은 예약, 환불 진행 건이 있는 경우에는 탈퇴할 수 없어요. 모든 처리가 완료된 후 탈퇴할 수 있어요.',
  '법령에 따라 보관이 필요한 거래 및 분쟁 처리 정보는 정해진 기간 동안 별도로 보관될 수 있어요.',
] as const

export const WithdrawalNoticeSection = () => {
  return (
    <section aria-labelledby="withdrawal-notice-heading">
      <h1
        className="typo-header-2 h-7.25 text-black"
        id="withdrawal-notice-heading"
      >
        회원 탈퇴 신청
      </h1>
      <p className="typo-body-3 mt-0.75 text-black">
        탈퇴하기 전에 아래 내용을 꼭 확인하세요
      </p>

      <ul className="mt-7.25 flex flex-col gap-3.75">
        {withdrawalNotices.map((notice) => (
          <li
            className="typo-body-8 text-cool-gray-700 bg-primary-100 rounded-[10px] px-4.25 py-3.25"
            key={notice}
          >
            {notice}
          </li>
        ))}
      </ul>
    </section>
  )
}
