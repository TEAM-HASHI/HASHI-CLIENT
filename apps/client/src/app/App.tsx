import { RouterProvider } from 'react-router-dom'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { PrerenderSnapshotCleanup } from '@/app/providers/PrerenderSnapshotCleanup'
import { router } from '@/app/router'

export const App = () => {
  return (
    <AuthSessionRestoreGate>
      <PrerenderSnapshotCleanup />
      <RouterProvider router={router} />
    </AuthSessionRestoreGate>
  )
}
