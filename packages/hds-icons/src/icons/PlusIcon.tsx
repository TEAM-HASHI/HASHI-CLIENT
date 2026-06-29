import type { SVGProps } from 'react'
const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 7.73682V16.2631"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path
      d="M16.2632 12H7.73687"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default PlusIcon
