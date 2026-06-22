import { transform } from '@svgr/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_FILE = fileURLToPath(import.meta.url)
const SCRIPT_DIR = path.dirname(SCRIPT_FILE)
const PACKAGE_DIR = path.resolve(SCRIPT_DIR, '..')

const RAW_ICONS_DIR = path.join(PACKAGE_DIR, 'src/rawIcons')
const ICONS_DIR = path.join(PACKAGE_DIR, 'src/icons')
const BARREL_FILE = path.join(ICONS_DIR, 'index.ts')

const convertToPascalCase = (fileName) => {
  return fileName
    .replace('.svg', '')
    .split(/[-_]/)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join('')
}

const generateIcons = async () => {
  const files = await fs.readdir(RAW_ICONS_DIR)
  const svgFiles = files.filter((file) => file.endsWith('.svg'))

  await fs.mkdir(ICONS_DIR, { recursive: true })

  const exports = []

  for (const svgFile of svgFiles) {
    const componentName = `${convertToPascalCase(svgFile)}Icon`
    const svgPath = path.join(RAW_ICONS_DIR, svgFile)
    const outputPath = path.join(ICONS_DIR, `${componentName}.tsx`)

    const svgCode = await fs.readFile(svgPath, 'utf-8')

    const componentCode = await transform(
      svgCode,
      {
        icon: true,
        typescript: true,
        expandProps: 'end',
        prettier: false,
        plugins: ['@svgr/plugin-jsx'],
      },
      { componentName },
    )

    await fs.writeFile(outputPath, `${componentCode}\n`)
    exports.push(
      `export { default as ${componentName} } from './${componentName}'`,
    )
  }

  await fs.writeFile(BARREL_FILE, `${exports.join('\n')}\n`)
}

generateIcons()
