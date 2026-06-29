import type { SVGProps } from 'react'
const SmileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={12} cy={12} r={9.3} stroke="#273033" strokeWidth={1.4} />
    <circle cx={9} cy={10} r={1} fill="#273033" />
    <circle cx={15} cy={10} r={1} fill="#273033" />
    <path
      d="M8.5 14C8.5 14 9.375 16 12 16C14.625 16 15.5 14 15.5 14"
      stroke="#FF5D5D"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default SmileIcon
