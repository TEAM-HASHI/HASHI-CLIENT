import type { TermsContentBlock, TermsList } from '@/features/terms/types'
import { cn } from '@/shared/utils'

const TermsListContent = ({ ordered, items }: TermsList) => {
  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <ListTag
      className={cn(
        'flex flex-col gap-1 pl-5',
        ordered ? 'list-decimal' : 'list-disc',
      )}
    >
      {items.map((item, index) => (
        <li key={`${index}-${item.text}`}>
          {item.text}
          {item.children ? (
            <TermsListContent
              items={item.children.items}
              ordered={item.children.ordered}
            />
          ) : null}
        </li>
      ))}
    </ListTag>
  )
}

interface TermsClauseContentProps {
  blocks: TermsContentBlock[]
}

export const TermsClauseContent = ({ blocks }: TermsClauseContentProps) => {
  return (
    <div className="flex flex-col gap-3 pb-3 break-keep">
      {blocks.map((block, index) =>
        block.type === 'paragraph' ? (
          <p key={`paragraph-${index}`}>{block.text}</p>
        ) : (
          <TermsListContent
            items={block.items}
            key={`list-${index}`}
            ordered={block.ordered}
          />
        ),
      )}
    </div>
  )
}
