import { execFileSync } from 'node:child_process'
import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setActionType('formatGeneratedFiles', (answers) => {
    const componentFolder = plop.renderString('{{camelCase name}}', answers)
    const componentName = plop.renderString('{{pascalCase name}}', answers)
    const componentPath = `packages/hds-ui/src/components/${componentFolder}`

    execFileSync(
      'pnpm',
      [
        'exec',
        'prettier',
        '--write',
        `${componentPath}/${componentName}.tsx`,
        `${componentPath}/${componentName}.spec.md`,
        `${componentPath}/${componentName}.stories.tsx`,
        `${componentPath}/index.ts`,
        'packages/hds-ui/src/components/index.ts',
      ],
      { stdio: 'inherit' },
    )

    return 'Formatted generated HDS component files'
  })

  plop.setActionType('formatGeneratedPageFiles', (answers) => {
    const pageFolder = plop.renderString('{{camelCase name}}', answers)
    const pageName = plop.renderString('{{pascalCase name}}', answers)
    const pagePath = `apps/client/src/pages/${pageFolder}`

    execFileSync(
      'pnpm',
      [
        'exec',
        'prettier',
        '--write',
        `${pagePath}/${pageName}Page.tsx`,
        `${pagePath}/${pageName}.spec.md`,
        `${pagePath}/index.ts`,
      ],
      { stdio: 'inherit' },
    )

    return 'Formatted generated page files'
  })

  plop.setGenerator('page', {
    description: 'Create a client page under apps/client/src/pages',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/client/src/pages/{{camelCase name}}/{{pascalCase name}}Page.tsx',
        templateFile: 'templates/page/page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/client/src/pages/{{camelCase name}}/{{pascalCase name}}.spec.md',
        templateFile: 'templates/page/page.spec.md.hbs',
      },
      {
        type: 'add',
        path: 'apps/client/src/pages/{{camelCase name}}/index.ts',
        templateFile: 'templates/page/index.ts.hbs',
      },
      {
        type: 'formatGeneratedPageFiles',
      },
    ],
  })

  plop.setGenerator('component', {
    description:
      'Create a shared client component under apps/client/src/shared/components',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/client/src/shared/components/{{camelCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/component/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/client/src/shared/components/{{camelCase name}}/index.ts',
        templateFile: 'templates/component/index.ts.hbs',
      },
    ],
  })

  plop.setGenerator('hook', {
    description:
      'Create a shared client hook under apps/client/src/shared/hooks',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name without use prefix',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/client/src/shared/hooks/use{{pascalCase name}}.ts',
        templateFile: 'templates/hook/hook.ts.hbs',
      },
    ],
  })

  plop.setGenerator('ds-component', {
    description:
      'Create an HDS UI component under packages/hds-ui/src/components',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Design system component name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/hds-ui/src/components/{{camelCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/ds-component/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/hds-ui/src/components/{{camelCase name}}/{{pascalCase name}}.spec.md',
        templateFile: 'templates/ds-component/component.spec.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/hds-ui/src/components/{{camelCase name}}/{{pascalCase name}}.stories.tsx',
        templateFile: 'templates/ds-component/component.stories.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/hds-ui/src/components/{{camelCase name}}/index.ts',
        templateFile: 'templates/ds-component/index.ts.hbs',
      },
      {
        type: 'append',
        path: 'packages/hds-ui/src/components/index.ts',
        template: [
          "export { {{pascalCase name}} } from './{{camelCase name}}'",
          "export type { {{pascalCase name}}Props } from './{{camelCase name}}'",
          '',
        ].join('\n'),
      },
      {
        type: 'formatGeneratedFiles',
      },
    ],
  })
}
