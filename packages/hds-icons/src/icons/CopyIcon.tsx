import type { SVGProps } from 'react'
const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={4}
      y={4}
      width={13.3715}
      height={13.3715}
      rx={1.02857}
      fill="currentColor"
    />
    <path
      d="M20.9712 8.85645C21.5392 8.85645 21.9994 9.31683 21.9995 9.88477V21.1992C21.9995 21.7673 21.5393 22.2275 20.9712 22.2275H9.65674C9.0888 22.2274 8.62842 21.7672 8.62842 21.1992V18.7314H16.1138C17.4329 18.7314 18.5024 17.6619 18.5024 16.3428V8.85645H20.9712Z"
      fill="currentColor"
    />
  </svg>
)
export default CopyIcon
