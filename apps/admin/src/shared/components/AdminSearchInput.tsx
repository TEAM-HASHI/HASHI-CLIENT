import { SearchIcon } from '@hashi/hds-icons'

interface AdminSearchInputProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export const AdminSearchInput = ({
  value,
  placeholder,
  onChange,
}: AdminSearchInputProps) => {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-cool-gray-100 text-cool-gray-900 focus:border-primary-200 focus:ring-primary-100 h-12 w-full rounded-md border bg-white pr-12 pl-4 text-sm font-medium transition outline-none focus:ring-2"
      />
      <SearchIcon
        aria-hidden="true"
        className="text-cool-gray-400 absolute top-1/2 right-4 size-5 -translate-y-1/2"
      />
    </label>
  )
}
