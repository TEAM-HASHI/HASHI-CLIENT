import type { SVGProps } from 'react'
const ShareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12V20H20V12"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path
      d="M12 4V20M15.5 7L12 4L8.5 7"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default ShareIcon
