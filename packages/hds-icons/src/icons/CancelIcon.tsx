import type { SVGProps } from 'react'
const CancelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 5L19 18.5"
      stroke="#273033"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path
      d="M19 5L5 18.5"
      stroke="#273033"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default CancelIcon
