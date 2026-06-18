import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
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
        path: 'apps/client/src/pages/{{camelCase name}}/index.ts',
        templateFile: 'templates/page/index.ts.hbs',
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
      'Create an SDS UI component under packages/sds-ui/src/components',
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
        path: 'packages/sds-ui/src/components/{{camelCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/ds-component/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/sds-ui/src/components/{{camelCase name}}/index.ts',
        templateFile: 'templates/ds-component/index.ts.hbs',
      },
      {
        type: 'append',
        path: 'packages/sds-ui/src/components/index.ts',
        template:
          "export { {{pascalCase name}} } from './{{camelCase name}}'\n",
      },
    ],
  })
}
