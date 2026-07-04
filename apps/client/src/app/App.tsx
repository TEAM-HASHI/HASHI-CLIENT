import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'

export const App = () => {
  return <RouterProvider router={router} />
}
