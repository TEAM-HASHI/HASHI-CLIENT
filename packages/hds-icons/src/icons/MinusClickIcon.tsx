import type { SVGProps } from 'react'
const MinusClickIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={12} cy={12} r={8.5} stroke="#FF5D5D" />
    <path
      d="M16.2632 12H7.73687"
      stroke="#FF5D5D"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default MinusClickIcon
