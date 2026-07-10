import type { SVGProps } from 'react'
const MagazineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x={26} y={8} width={14} height={17} rx={2} fill="#FF5D5D" />
    <rect x={9} y={8} width={14.7368} height={16.5789} rx={2} fill="#273033" />
    <rect
      x={9}
      y={26.4209}
      width={14.7368}
      height={16.5789}
      rx={2}
      fill="#273033"
    />
    <rect
      x={25.5791}
      y={26.4209}
      width={14.7368}
      height={16.5789}
      rx={2}
      fill="#273033"
    />
    <path
      d="M38 8C39.1046 8 40 8.89543 40 10V23C40 24.1046 39.1046 25 38 25H34.2412C33.8041 20.5671 30.3747 17.0155 26 16.3896V10C26 8.89543 26.8954 8 28 8H38Z"
      fill="#273033"
    />
  </svg>
)
export default MagazineIcon
