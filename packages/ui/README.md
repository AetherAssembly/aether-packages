# @aetherAssembly/ui

Build React 19 interfaces with accessible buttons, form controls, cards, badges, and dialogs. Components use native HTML behavior and `--ae-*` CSS custom properties, so you can keep familiar browser interactions and match your app's theme.

## Install

In your project's `.npmrc`, route the AetherAssembly scope to GitHub Packages:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Add authentication to your user-level `~/.npmrc`, outside the project repository:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a GitHub token with `read:packages` permission. Do not put the token in a project file or commit it. Install the package with its React peers:

```sh
npm install @aetherAssembly/ui react@^19 react-dom@^19
```

Import the stylesheet once from your application entry point:

```tsx
import '@aetherAssembly/ui/styles.css'
```

## Get started

This example keeps a field controlled by React and opens a dialog when the user asks to preview the result:

```tsx
import { useState } from 'react'
import { Button, Card, Input, Modal } from '@aetherAssembly/ui'

export function Profile() {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <Card header={<h2>Profile</h2>}>
      <Input
        label="Display name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        hint="Shown to other users"
      />
      <Button onClick={() => setOpen(true)}>Preview</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Profile preview">
        <p>{name || 'No name entered'}</p>
      </Modal>
    </Card>
  )
}
```

## Find the right component

| Component  | Use it for                                          |
| ---------- | --------------------------------------------------- |
| `Button`   | Actions, form submission, and loading states        |
| `Input`    | Single-line text and other native input types       |
| `Textarea` | Multiline text                                      |
| `Select`   | A choice from native `<option>` elements            |
| `Checkbox` | A native checkbox with a label                      |
| `Field`    | A label and help/error text around a custom control |
| `Modal`    | A controlled native dialog                          |
| `Card`     | Content with optional header and footer             |
| `Badge`    | A short status label                                |

Each component accepts its public props type, such as `InputProps` or `ModalProps`. Native HTML attributes and React 19 refs are supported where relevant.

## Build forms

Give each control a visible label or another accessible name. Add `hint` for instructions and `error` for a validation message:

```tsx
import { Checkbox, Field, Input, Select, Textarea } from '@aetherAssembly/ui'

<Input label="Email" type="email" required hint="For account updates" />
<Textarea label="Notes" rows={4} />
<Select label="Category" defaultValue="personal">
  <option value="personal">Personal</option>
  <option value="work">Work</option>
</Select>
<Checkbox label="Receive updates" />
<Field label="Volume" hint="Choose a level">
  {(attributes) => <input {...attributes} type="range" />}
</Field>
```

`Input`, `Textarea`, `Select`, and `Checkbox` accept native control props, event handlers, and React 19 refs. They support `label`, `hint`, `error`, and `wrapperClassName`. Use `className` to style the control itself.

Controls generate IDs with React `useId()` unless you provide one. Repeated labels are safe. Error text replaces hint text, sets `aria-invalid`, and is connected through `aria-describedby`; caller-provided description references are retained. Caller-provided `aria-invalid` is preserved when there is no error.

`Checkbox` always renders `type="checkbox"`. `Select` uses native options and keyboard behavior. `Field` passes `id`, `aria-describedby`, and `aria-invalid` to a custom control through its render function. If you use static children instead, connect the matching ID and accessibility attributes yourself.

## Add actions and status

`Button` variants are `primary`, `secondary`, `ghost`, and `danger`. Sizes are `sm`, `md`, and `lg`. Loading disables the button and sets `aria-busy`, even if `disabled={false}`. Buttons default to `type="button"`; set `type="submit"` when the button should submit a form.

```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="danger" loading={saving}>Delete</Button>
<Button type="submit">Submit form</Button>
<Badge variant="success">Synced</Badge>
```

Badge variants are `default`, `success`, `warning`, `danger`, and `info`. Cards render an article and support `header`, `footer`, and children. Badges render spans. Both pass through native attributes and `className`.

## Show a dialog

Keep dialog visibility in your app state. `onClose` tells your app that the user requested dismissal; update `open` in the handler:

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Confirm deletion">
  <p>Delete this item?</p>
  <Button variant="danger" onClick={deleteItem}>
    Delete
  </Button>
</Modal>
```

The close button, Escape, backdrop clicks, and native dialog close actions request dismissal once per open cycle. Closing through the `open` prop does not call `onClose`. The title provides the accessible name. For an untitled dialog, provide a meaningful `aria-label` or `aria-labelledby`; the fallback name is “Dialog”. A close button is always available. Native dialog props pass through, and `onCancel` can prevent Escape dismissal. `showModal()` provides native focus behavior and restores focus when the dialog closes.

## Match your theme

Import the stylesheet before your overrides. Set tokens on `:root` or on a containing element to theme one part of your app:

```css
:root {
  --ae-color-primary: #4338ca;
  --ae-color-primary-hover: #3730a3;
  --ae-radius-md: 0.5rem;
  --ae-font-sans: system-ui, sans-serif;
}

.dark {
  --ae-color-bg: #111827;
  --ae-color-surface: #1f2937;
  --ae-color-text: #f9fafb;
  --ae-color-text-muted: #d1d5db;
  --ae-color-border: #4b5563;
}
```

Tokens cover colors, spacing, typography, radius, shadows, and transitions. See the [stylesheet](./src/styles.css) for the full list. Components include keyboard focus styles and respect reduced-motion preferences. Check contrast after applying your own palette.

## Use the gallery or upgrade

From the [repository root](../../), run `npm install` and `npm run gallery` to try variants, loading and error states, keyboard examples, and theme overrides.

When upgrading to the next release, move existing Input wrapper styles from `className` to `wrapperClassName`, use explicit IDs if external selectors depended on label text, specify submit button types, and update Modal handlers to treat `onClose` as a dismissal request. See the [component guide](../../docs/ui-components.md) and [changelog](../../CHANGELOG.md).

## TypeScript exports

Import component props types along with the components. `ButtonVariant`, `ButtonSize`, and `BadgeVariant` are also available:

```ts
import type { ButtonProps, ButtonVariant, InputProps } from '@aetherAssembly/ui'
```

## License

[MIT](./LICENSE). Optional public credit, such as “Powered by AetherAssembly” with a link to the [project](https://github.com/AetherAssembly/aether-packages), is appreciated but is not a license requirement.
