import type { SVGProps } from 'react'
const MyReservationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 12.3892L20.5618 7.16451C21.9084 11.6908 19.3307 16.4516 14.8045 17.7982L13.6337 18.1465C9.10744 19.4931 4.34656 16.9154 3 12.3892Z"
      fill="currentColor"
    />
    <path
      d="M3 12.0503H21.3225C21.3225 16.7726 17.4943 20.6008 12.772 20.6008H11.5505C6.8282 20.6008 3 16.7726 3 12.0503Z"
      fill="currentColor"
    />
    <rect x={3} y={12.0503} width={18.3225} height={0.610751} fill="white" />
    <rect
      x={3}
      y={4.65967}
      width={0.977201}
      height={8.55051}
      rx={0.3}
      transform="rotate(-31.9543 3 4.65967)"
      fill="currentColor"
    />
    <rect
      x={5.44287}
      y={3.94238}
      width={0.977201}
      height={8.55051}
      rx={0.3}
      transform="rotate(-26.9126 5.44287 3.94238)"
      fill="currentColor"
    />
  </svg>
)
export default MyReservationIcon
