import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { MypageMenuCard } from '@/pages/mypage/components/MypageMenuCard'
import { MypageMenuSection } from '@/pages/mypage/components/MypageMenuSection'
import { MypagePointSummary } from '@/pages/mypage/components/MypagePointSummary'
import { MypageProfile } from '@/pages/mypage/components/MypageProfile'
import { useMypagePage } from '@/pages/mypage/hooks/useMypagePage'
import { LoadingScreen } from '@/shared/components/loadingScreen'

export const MypagePage = () => {
  const {
    isComingSoonOpen,
    isLoading,
    menuSections,
    primaryMenuItems,
    setIsComingSoonOpen,
    summary,
    handleMenuAction,
  } = useMypagePage()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <section className="app-mobile-bottom-nav-content px-5 pt-[calc(42px+var(--safe-area-top,0px))]">
        <MypageProfile
          nickname={summary.nickname}
          profileImageUrl={summary.profileImageUrl}
        />

        <MypagePointSummary point={summary.availablePoint} />

        <div className="mb-8 flex flex-col gap-3.25">
          {primaryMenuItems.map((item) => (
            <MypageMenuCard
              action={item.action}
              count={item.count}
              highlighted={item.highlighted}
              key={item.id}
              label={item.label}
              onPress={handleMenuAction}
            />
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {menuSections.map((section) => (
            <MypageMenuSection
              key={section.id}
              onMenuPress={handleMenuAction}
              section={section}
            />
          ))}
        </div>
      </section>

      <ComingSoonDialog
        onOpenChange={setIsComingSoonOpen}
        open={isComingSoonOpen}
      />
    </>
  )
}
