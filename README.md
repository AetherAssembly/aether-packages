# AetherAssembly packages

Use these shared TypeScript packages to add browser storage or React 19 interface components to an AetherAssembly app. Both packages are published to GitHub Packages under the `@aetherAssembly` scope.

| Package                                   | Use it for                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| [`@aetherAssembly/core`](./packages/core) | IndexedDB, localStorage, or in-memory storage with one async interface |
| [`@aetherAssembly/ui`](./packages/ui)     | React 19 form controls, buttons, cards, badges, and dialogs            |

The packages are used by [Driftleaf](https://github.com/AetherAssembly/Driftleaf) and are available for other apps in the ecosystem.

## Install a package

GitHub Packages needs the registry scope and an authenticated token with `read:packages` permission, including for public packages.

In the consuming project's `.npmrc`, route the scope to GitHub Packages:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Keep the token in your user-level `~/.npmrc` or in your CI secret store, not in the project:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a GitHub token with `read:packages` access, then install what your app needs:

```sh
npm install @aetherAssembly/core
npm install @aetherAssembly/ui react@^19 react-dom@^19
```

The UI package requires React 19 and `react-dom` 19 as peer dependencies.

## Add storage with `@aetherAssembly/core`

Choose an adapter based on where the data should live:

| Adapter               | Use it when                                                        | Data lifetime                   |
| --------------------- | ------------------------------------------------------------------ | ------------------------------- |
| `IDBAdapter`          | A browser app needs persistent storage through IndexedDB           | Persists in the browser         |
| `LocalStorageAdapter` | Small values should persist in browser localStorage                | Persists in the browser         |
| `MemoryAdapter`       | You need temporary state, server-side rendering, or a test adapter | Until the instance is discarded |

All adapters share the same async interface, so you can switch implementations without changing the calls your app makes:

```ts
import { IDBAdapter } from '@aetherAssembly/core'

const storage = new IDBAdapter('my-app', 'settings')
await storage.set('theme', 'dark')
const theme = await storage.get<string>('theme')
```

The interface also provides `delete`, `clear`, and `keys`. Missing keys return `null`. Review [storage behavior and migration guidance](./docs/storage.md) before choosing an adapter for data that must persist.

## Build an interface with `@aetherAssembly/ui`

Import the stylesheet once from your app entry point. Override the `--ae-*` CSS custom properties to match your app's theme:

```tsx
import { Button, Input } from '@aetherAssembly/ui'
import '@aetherAssembly/ui/styles.css'

export function SettingsForm() {
  return (
    <form>
      <Input label="Display name" name="displayName" />
      <Button type="submit">Save settings</Button>
    </form>
  )
}
```

The package also provides `Textarea`, `Select`, `Checkbox`, `Field`, `Modal`, `Card`, and `Badge`. See the [component guide](./docs/ui-components.md) for accessible form patterns, dialog behavior, and theming. Run `npm run gallery` in this repository to try the components interactively.

## Work on the packages

Use Node.js 22.22.2+, 24.15+, or 26+. From the repository root, install dependencies and run the checks:

```sh
npm install
npm run build
npm run typecheck
npm test
npm run test:packages
npm run lint
npm run format:check
```

To run the browser checks, install Chromium once with `npx playwright install chromium`, then run `npm run test:browser`.

For contribution steps, see [CONTRIBUTING.md](./CONTRIBUTING.md). Maintainers can find release instructions in the [publishing guide](./docs/publishing.md).

## License

Licensed under [MIT](./LICENSE). Optional public credit, such as “Powered by AetherAssembly” with a link to https://github.com/AetherAssembly/aether-packages, is appreciated but is not a license requirement. MIT's copyright and permission notice requirements still apply.
