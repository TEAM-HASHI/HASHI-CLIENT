const steps = ['기본 정보', '가격·이미지', '영업시간', '메뉴·노출']

export const RestaurantFormStepper = ({ step }: { step: number }) => (
  <ol aria-label="식당 등록 단계" className="mb-6 grid grid-cols-4 gap-2">
    {steps.map((label, index) => (
      <li key={label} aria-current={step === index ? 'step' : undefined}>
        <div
          className={`h-1.5 rounded-full ${index <= step ? 'bg-primary-200' : 'bg-cool-gray-100'}`}
        />
        <p
          className={`mt-2 text-xs font-bold ${index === step ? 'text-primary-200' : 'text-cool-gray-400'}`}
        >
          {index + 1}. {label}
        </p>
      </li>
    ))}
  </ol>
)
