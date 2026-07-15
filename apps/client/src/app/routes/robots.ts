import { createRobotsText } from '@/shared/seo/searchResources'

export const loader = () =>
  new Response(createRobotsText(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
