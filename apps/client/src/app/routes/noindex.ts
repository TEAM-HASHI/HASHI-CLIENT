import type { MetaFunction } from 'react-router'

import { createNoIndexMeta } from '@/shared/seo/metadata'

export const noIndexMeta: MetaFunction = () => createNoIndexMeta()
