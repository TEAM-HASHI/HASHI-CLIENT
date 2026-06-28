import type { SVGProps } from 'react'
const TalkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2.91602 15.6562C7.48317 13.9436 12.5168 13.9436 17.084 15.6562C17.635 15.863 17.9999 16.39 18 16.9785V20.9863C18 21.2411 17.7529 21.4226 17.5098 21.3467C12.6199 19.8186 7.3801 19.8186 2.49023 21.3467C2.24706 21.4226 2.00001 21.2411 2 20.9863V16.9785C2.00006 16.39 2.36501 15.863 2.91602 15.6562ZM10 2.5C12.7614 2.5 15 4.73858 15 7.5C15 10.2614 12.7614 12.5 10 12.5C7.23858 12.5 5 10.2614 5 7.5C5 4.73858 7.23858 2.5 10 2.5Z"
      fill="#273033"
    />
    <path
      d="M17 6C17 6 18 6.625 18 8.5C18 10.375 17 11 17 11"
      stroke="#FF5D5D"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path
      d="M19 4C19 4 21 5.125 21 8.5C21 11.875 19 13 19 13"
      stroke="#FF5D5D"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
)
export default TalkIcon
