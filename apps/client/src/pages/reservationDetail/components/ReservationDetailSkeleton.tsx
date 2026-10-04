const blockClassName = 'animate-pulse rounded-[4px] bg-secondary-200'

export const ReservationDetailSkeleton = () => {
  return (
    <div
      aria-busy="true"
      aria-label="예약 상세 정보를 불러오는 중"
      role="status"
    >
      <div aria-hidden="true">
        <div className="px-6 py-6">
          <div className={`${blockClassName} mb-4 h-5 w-32`} />
          <div className="mb-6 flex gap-3">
            <div className={`${blockClassName} size-17 shrink-0`} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className={`${blockClassName} h-5 w-full`} />
              <div className={`${blockClassName} h-5 w-3/4`} />
              <div className={`${blockClassName} h-4 w-2/3`} />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((step) => (
              <div className="flex items-center gap-3" key={step}>
                <div
                  className={`${blockClassName} size-3.5 shrink-0 rounded-full`}
                />
                <div className="flex h-13 flex-1 flex-col justify-center gap-2 px-4">
                  <div className={`${blockClassName} h-4 w-24`} />
                  <div className={`${blockClassName} h-3 w-48 max-w-full`} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-warm-gray-100 mt-6 mb-9.25 rounded-[10px] border px-5 py-4">
            <div className={`${blockClassName} mb-5 h-5 w-28`} />
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <div className="flex justify-between gap-6" key={item}>
                  <div className={`${blockClassName} h-4 w-20`} />
                  <div
                    className={`${blockClassName} w-32 ${item === 2 ? 'h-8' : 'h-4'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-warm-gray-50 border-t-8 px-5 pt-5 pb-7">
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((line) => (
              <div className={`${blockClassName} h-4 w-full`} key={line} />
            ))}
          </div>
        </div>
        <div className="app-mobile-fixed-bottom z-fixed flex min-h-[calc(var(--app-mobile-bottom-action-height)+var(--safe-area-bottom,0px))] gap-4 bg-white px-5 pt-4">
          <div className={`${blockClassName} h-10.5 flex-1`} />
          <div className={`${blockClassName} h-10.5 flex-1`} />
        </div>
      </div>
    </div>
  )
}
