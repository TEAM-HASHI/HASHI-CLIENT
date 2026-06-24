import { transform } from '@svgr/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import prettier from 'prettier'
import { fileURLToPath } from 'node:url'

const SCRIPT_FILE = fileURLToPath(import.meta.url)
const SCRIPT_DIR = path.dirname(SCRIPT_FILE)
const PACKAGE_DIR = path.resolve(SCRIPT_DIR, '..')

const RAW_ICONS_DIR = path.join(PACKAGE_DIR, 'src/rawIcons')
const ICONS_DIR = path.join(PACKAGE_DIR, 'src/icons')
const BARREL_FILE = path.join(ICONS_DIR, 'index.ts')

const SVG_FILE_NAME_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/
const GENERATED_ICON_FILE_REGEX = /^[A-Z][A-Za-z0-9]*Icon\.tsx$/

const convertToPascalCase = (fileName) => {
  return fileName
    .replace('.svg', '')
    .split('-')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join('')
}

const checkIsSvgFileNameValid = (fileName) => {
  return SVG_FILE_NAME_REGEX.test(fileName)
}

const formatCode = async (code, parser) => {
  return prettier.format(code, {
    parser,
    semi: false,
    singleQuote: true,
  })
}

const removeGeneratedIconFiles = async () => {
  await fs.mkdir(ICONS_DIR, { recursive: true })

  const files = await fs.readdir(ICONS_DIR)
  const generatedIconFiles = files.filter((file) =>
    GENERATED_ICON_FILE_REGEX.test(file),
  )

  await Promise.all(
    generatedIconFiles.map((file) => fs.rm(path.join(ICONS_DIR, file))),
  )
}

const checkComponentNameDuplicated = (svgFiles) => {
  const componentNames = new Map()

  svgFiles.forEach((svgFile) => {
    const componentName = `${convertToPascalCase(svgFile)}Icon`
    const duplicatedFileName = componentNames.get(componentName)

    if (duplicatedFileName) {
      throw new Error(
        `[sds-icons] 중복된 컴포넌트명이 생성됩니다: ${duplicatedFileName}, ${svgFile} → ${componentName}`,
      )
    }

    componentNames.set(componentName, svgFile)
  })
}

const validateSvgFiles = (svgFiles) => {
  svgFiles.forEach((svgFile) => {
    if (!checkIsSvgFileNameValid(svgFile)) {
      throw new Error(
        `[sds-icons] SVG 파일명은 kebab-case만 허용합니다: ${svgFile}`,
      )
    }
  })

  checkComponentNameDuplicated(svgFiles)
}

const generateIcons = async () => {
  const files = await fs.readdir(RAW_ICONS_DIR)
  const svgFiles = files.filter((file) => file.endsWith('.svg')).sort()

  validateSvgFiles(svgFiles)
  await removeGeneratedIconFiles()

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
        jsxRuntime: 'automatic',
        prettier: false,
        plugins: ['@svgr/plugin-jsx'],
      },
      { componentName },
    )

    const formattedComponentCode = await formatCode(componentCode, 'typescript')

    await fs.writeFile(outputPath, formattedComponentCode)
    exports.push(
      `export { default as ${componentName} } from './${componentName}'`,
    )
  }

  const barrelCode = `${exports.join('\n')}\n`
  const formattedBarrelCode = await formatCode(barrelCode, 'typescript')

  await fs.writeFile(BARREL_FILE, formattedBarrelCode)
}

generateIcons()
