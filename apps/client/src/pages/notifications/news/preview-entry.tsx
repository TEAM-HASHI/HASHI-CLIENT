import { createRoot } from 'react-dom/client'

import { NotificationNewsPreview } from '@/pages/notifications/news/NotificationNewsPreview'

if (import.meta.env.DEV) {
  createRoot(document.getElementById('root')!).render(
    <NotificationNewsPreview />,
  )
}
