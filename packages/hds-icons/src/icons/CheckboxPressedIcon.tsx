import type { SVGProps } from 'react'
const CheckboxPressedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width={26} height={26} rx={3} fill="#DEEDF4" />
    <path
      d="M8 11.5L12.3185 17.258C12.4045 17.3727 12.5797 17.3623 12.6516 17.2382L18 8"
      stroke="#273033"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
)
export default CheckboxPressedIcon
