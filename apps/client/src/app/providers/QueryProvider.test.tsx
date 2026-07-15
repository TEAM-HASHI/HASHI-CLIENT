import { render } from '@testing-library/react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import QueryProvider from '@/app/providers/QueryProvider'

const ClientObserver = ({
  onClient,
}: {
  onClient: (client: QueryClient) => void
}) => {
  onClient(useQueryClient())

  return null
}

describe('QueryProvider', () => {
  it('isolates the QueryClient for each application render', () => {
    const clients: QueryClient[] = []
    const firstRender = render(
      <QueryProvider>
        <ClientObserver onClient={(client) => clients.push(client)} />
      </QueryProvider>,
    )

    firstRender.unmount()

    render(
      <QueryProvider>
        <ClientObserver onClient={(client) => clients.push(client)} />
      </QueryProvider>,
    )

    expect(clients).toHaveLength(2)
    expect(clients[0]).not.toBe(clients[1])
  })
})
