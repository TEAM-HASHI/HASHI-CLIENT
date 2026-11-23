const { readFile, writeFile } = require('node:fs/promises')
const { join } = require('node:path')
const { withDangerousMod } = require('expo/config-plugins')

const foreground =
  '<foreground android:drawable="@mipmap/ic_launcher_foreground"/>'
const inset = [
  '<foreground>',
  '        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="14%"/>',
  '    </foreground>',
].join('\n')

module.exports = (config) =>
  withDangerousMod(config, [
    'android',
    async (config) => {
      const resourceDir = join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/mipmap-anydpi-v26',
      )

      // Keep the shared image within Android's launcher mask.
      for (const name of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
        const file = join(resourceDir, name)
        const xml = await readFile(file, 'utf8')
        if (xml.includes(inset)) continue
        if (!xml.includes(foreground)) {
          throw new Error(`Unexpected Expo launcher resource: ${name}`)
        }
        await writeFile(file, xml.replace(foreground, inset))
      }

      return config
    },
  ])
