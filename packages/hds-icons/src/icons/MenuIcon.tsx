import type { SVGProps } from 'react'
const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={9.5} cy={3} r={1.5} fill="currentColor" />
    <circle cx={9.5} cy={9} r={1.5} fill="currentColor" />
    <circle cx={9.5} cy={15} r={1.5} fill="currentColor" />
  </svg>
)
export default MenuIcon
