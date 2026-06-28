import type { SVGProps } from 'react'
const MemoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M19.5 4.5V14.2764L14.8076 18.5H4.5V4.5H19.5Z" stroke="#273033" />
    <path
      d="M15.5 14.5996H19.7393L15.0996 18.7754V15C15.0996 14.7791 15.2791 14.5996 15.5 14.5996Z"
      fill="#FF5D5D"
      stroke="#FF5D5D"
      strokeWidth={0.2}
      strokeLinecap="round"
    />
  </svg>
)
export default MemoIcon
