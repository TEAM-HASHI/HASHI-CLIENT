import { resolve } from 'node:path'

import type { Plugin, ResolvedConfig } from 'vite'

import { generateSeoArtifacts } from './generateSeoArtifacts'

interface SeoPrerenderPluginParams {
  apiBaseUrl: string
}

export const seoPrerenderPlugin = ({
  apiBaseUrl,
}: SeoPrerenderPluginParams): Plugin => {
  let config: ResolvedConfig

  return {
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    enforce: 'post',
    name: 'hashi-seo-prerender',
    async writeBundle() {
      if (!apiBaseUrl.trim()) {
        throw new Error('SEO prerender에 VITE_API_BASE_URL이 필요합니다.')
      }

      const result = await generateSeoArtifacts({
        apiBaseUrl,
        outputDir: resolve(config.root, config.build.outDir),
      })

      config.logger.info(
        `[SEO] restaurants=${result.restaurants}, menus=${result.menus}, magazines=${result.magazines}, urls=${result.urls}`,
      )
    },
  }
}
