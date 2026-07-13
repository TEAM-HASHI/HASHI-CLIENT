import { RouterProvider } from 'react-router-dom'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { router } from '@/app/router'

export const App = () => {
  return (
    <AuthSessionRestoreGate>
      <RouterProvider router={router} />
    </AuthSessionRestoreGate>
  )
}
