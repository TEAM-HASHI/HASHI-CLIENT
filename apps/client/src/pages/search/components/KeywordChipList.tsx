import { Chip } from '@hashi/hds-ui'

interface KeywordChipListProps {
  keywords: readonly string[]
  onKeywordSelect: (keyword: string) => void
}

export const KeywordChipList = ({
  keywords,
  onKeywordSelect,
}: KeywordChipListProps) => {
  if (keywords.length === 0) {
    return null
  }

  return (
    <div className="-mx-5 [scrollbar-width:none] overflow-x-auto pl-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-3">
        {keywords.map((keyword) => (
          <li key={keyword}>
            <Chip
              className="text-black"
              onSelectedChange={() => {
                onKeywordSelect(keyword)
              }}
            >
              {keyword}
            </Chip>
          </li>
        ))}
      </ul>
    </div>
  )
}
