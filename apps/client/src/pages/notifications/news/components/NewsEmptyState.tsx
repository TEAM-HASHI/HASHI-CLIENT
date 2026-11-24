import emptyNotifications from '@/pages/notifications/news/assets/empty-notifications.png'

export const NewsEmptyState = () => (
  <div className="flex flex-col items-center px-5 pt-36 text-center">
    <img
      alt=""
      aria-hidden="true"
      src={emptyNotifications}
      className="h-30 w-33.25 shrink-0"
    />
    <h2 className="typo-header-3 text-primary-200 mt-1.5 leading-[1.5]">
      아직 받은 알림이 없어요
    </h2>
    <p className="typo-body-6 text-cool-gray-500 mt-3 leading-[1.36]">
      새로운 소식이 생기면 여기서 알려드릴게요.
    </p>
  </div>
)
