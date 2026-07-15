import { HydrationBoundary } from '@tanstack/react-query'
import type {
  ClientLoaderFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from 'react-router'
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from 'react-router'

import { NotFoundPage } from '@/pages/notFound'
import { RestaurantDetailPage } from '@/pages/restaurantDetail'
import { createNoIndexMeta, createPageMeta } from '@/shared/seo/metadata'
import {
  loadClientRouteData,
  parsePublicRestaurantId,
} from '@/shared/seo/publicRouteData'
import { loadRestaurantDetailRouteData } from '@/shared/seo/publicRouteLoaders'
import { createRestaurantStructuredData } from '@/shared/seo/structuredData'

const loadRestaurant = (
  params: LoaderFunctionArgs['params'] | ClientLoaderFunctionArgs['params'],
) => {
  const restaurantId = parsePublicRestaurantId(params.restaurantId)

  if (restaurantId === null) {
    throw new Response('Not Found', { status: 404 })
  }

  return loadRestaurantDetailRouteData(restaurantId)
}

export const loader = ({ params }: LoaderFunctionArgs) => loadRestaurant(params)
export const clientLoader = ({ params }: ClientLoaderFunctionArgs) =>
  loadClientRouteData(() => loadRestaurant(params))

export const meta: MetaFunction<typeof clientLoader> = ({
  error,
  loaderData,
}) => {
  if (error || !loaderData || !('restaurant' in loaderData)) {
    return createNoIndexMeta()
  }

  const { summary } = loaderData.restaurant
  const description =
    summary.summary?.trim() ||
    `${summary.name}의 메뉴, 매장 정보와 예약 방법을 확인해 보세요.`
  const imageUrl = summary.thumbnailUrl || summary.imageUrls[0]

  return [
    ...createPageMeta({
      description,
      imageUrl,
      path: `/restaurants/${summary.restaurantId}`,
      title: `${summary.name} - 메뉴와 예약 정보 | HASHI`,
      type: 'restaurant',
    }),
    {
      'script:ld+json': createRestaurantStructuredData({
        address: summary.address,
        description,
        imageUrls: imageUrl ? [imageUrl] : [],
        name: summary.name,
        restaurantId: summary.restaurantId,
      }),
    },
  ]
}

const RestaurantDetailRoute = () => {
  const { dehydratedState } = useLoaderData<typeof clientLoader>()

  return (
    <HydrationBoundary state={dehydratedState}>
      <RestaurantDetailPage />
    </HydrationBoundary>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  return <p>문제가 발생했습니다.</p>
}

export default RestaurantDetailRoute
