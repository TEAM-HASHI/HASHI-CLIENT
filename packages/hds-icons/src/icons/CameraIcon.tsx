import type { SVGProps } from 'react'
const CameraIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x={7} y={6} width={2} height={2} rx={0.454545} fill="#273033" />
    <rect
      x={2}
      y={5.14307}
      width={19.4286}
      height={14.8571}
      rx={1.14286}
      fill="#273033"
    />
    <rect
      x={8.39979}
      y={9.25721}
      width={6.62857}
      height={6.62857}
      rx={3.31429}
      stroke="white"
      strokeWidth={0.914286}
    />
    <rect
      x={15.6001}
      y={7.31443}
      width={1.37143}
      height={1.37143}
      rx={0.685714}
      fill="white"
      stroke="white"
      strokeWidth={0.228571}
    />
    <rect
      x={5.42871}
      y={4}
      width={2.28571}
      height={2.28571}
      rx={0.519481}
      fill="#FF5D5D"
    />
  </svg>
)
export default CameraIcon
