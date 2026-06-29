import type { SVGProps } from 'react'
const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={12.5} cy={12.5} r={9.5} fill="#273033" />
    <path
      d="M12.5 13.3638L9.04541 16.8183"
      stroke="white"
      strokeWidth={0.345455}
      strokeLinecap="round"
    />
    <path
      d="M12.5 8.18262V13.3644H16.8182"
      stroke="#FF5D5D"
      strokeLinecap="round"
    />
  </svg>
)
export default ClockIcon
