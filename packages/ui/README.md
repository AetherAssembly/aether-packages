# @aetherAssembly/ui

React 19 components for forms, actions, status, and dialogs. Components use native
HTML behavior and `--ae-*` CSS custom properties so applications can supply their
own theme.

## Installation

Configure your project's `.npmrc` for GitHub Packages:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Configure authentication only in your user-level `~/.npmrc` (in your home
directory, outside the project repository):

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` in your shell environment to a GitHub token with
`read:packages` permission. Keep tokens and authentication settings out of the
project's `.npmrc` and version control. Then install the package and its React 19 peers:

```sh
npm install @aetherAssembly/ui react@^19 react-dom@^19
```

Import the stylesheet once at your application entry point:

```tsx
import '@aetherAssembly/ui/styles.css'
```

## Quick start

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
        onChange={event => setName(event.target.value)}
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

## Components

| Component | Main props and behavior |
| --- | --- |
| `Button` | `variant`: primary, secondary, ghost, danger; `size`: sm, md, lg; `loading` disables interaction and shows a spinner |
| `Card` | Optional `header` and `footer` slots around body children |
| `Badge` | `variant`: default, success, warning, danger, info |
| `Input` | Native input with optional label, hint, and error |
| `Textarea` | Native multiline input with the same field presentation |
| `Select` | Native select; provide option children |
| `Checkbox` | Native checkbox with label, hint, and error |
| `Field` | Shared label/helper/error wrapper for custom controls |
| `Modal` | Controlled native dialog with title, close button, and dismissal requests |

### Buttons and status

```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="danger" loading={saving}>Delete</Button>
<Button type="submit">Submit form</Button>
<Badge variant="success">Synced</Badge>
```

Buttons default to `type="button"`. Set `type="submit"` for form submission.
Loading always disables the button, even with `disabled={false}`, and sets
`aria-busy`.

### Forms

```tsx
import { Input, Textarea, Select, Checkbox, Field } from '@aetherAssembly/ui'

<Input label="Email" type="email" required hint="For account updates" />
<Textarea label="Notes" rows={4} />
<Select label="Category" defaultValue="personal">
  <option value="personal">Personal</option>
  <option value="work">Work</option>
</Select>
<Checkbox label="Receive updates" />
<Field label="Volume" hint="Choose a level">
  {attributes => <input {...attributes} type="range" />}
</Field>
```

Input, Textarea, Select, and Checkbox support native control attributes, event
handlers, and React 19 refs. All accept optional `label`, `hint`, `error`, and
`wrapperClassName`. `className` styles the control itself. Checkbox always uses
`type="checkbox"`.

IDs use React `useId()` unless explicitly supplied. Repeated labels remain safe;
provide a label or another accessible name. Errors replace hints, set
`aria-invalid`, and are linked with `aria-describedby`. Caller-provided
description references are retained, as is caller `aria-invalid` when no error
is present.

Field's render function supplies `id`, `aria-describedby`, and `aria-invalid`
for a custom control. With static children, wire the matching ID and accessibility
attributes yourself.

### Dialogs

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm deletion"
>
  <p>Delete this item?</p>
  <Button variant="danger" onClick={deleteItem}>Delete</Button>
</Modal>
```

The owner controls `open`. `onClose` requests dismissal through the close button,
Escape, backdrop clicks, or a native dialog close action, once per open cycle.
Update `open` in the handler. Prop-driven closing does not invoke `onClose`.

Titles are connected to the dialog's accessible name. For untitled dialogs,
supply a meaningful `aria-label` or `aria-labelledby`; the fallback name is
“Dialog”. A close button is always rendered. Native dialog props pass through;
`onCancel` can prevent Escape dismissal. Native `showModal()` handles modal focus
behavior and focus restoration.

### Cards

```tsx
<Card header={<h2>Settings</h2>} footer={<Button>Save</Button>}>
  <p>Card content</p>
</Card>
```

Cards render an article; badges render a span. Their native attributes and
`className` pass through.

## Theming

Import the stylesheet before your overrides. Customize tokens on `:root` or a
containing theme element:

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

Token groups cover colors, spacing, typography, radius, shadows, and transitions.
See the [stylesheet](https://github.com/AetherAssembly/aether-packages/blob/main/packages/ui/src/styles.css)
for the full list. Components include keyboard focus styles and respect reduced
motion preferences. Review contrast when customizing your palette.

## TypeScript exports

Each component exports its corresponding props type, such as `InputProps`,
`ModalProps`, and `FieldProps`. `ButtonVariant`, `ButtonSize`, and `BadgeVariant`
are also exported:

```ts
import type { ButtonProps, ButtonVariant, InputProps } from '@aetherAssembly/ui'
```

## Gallery and migration

From the [repository](https://github.com/AetherAssembly/aether-packages), run
`npm install` and `npm run gallery` for interactive variants, loading/error states,
keyboard examples, and theme overrides.

For the upcoming release, move existing Input wrapper styles from `className`
to `wrapperClassName`, use explicit IDs if external selectors depended on label
text, specify submit buttons explicitly, and update Modal handlers to treat
`onClose` as a dismissal request. See the [component guide](https://github.com/AetherAssembly/aether-packages/blob/main/docs/ui-components.md)
and [changelog](https://github.com/AetherAssembly/aether-packages/blob/main/CHANGELOG.md).

## License

[MIT](./LICENSE). Optional public credit, such as “Powered by AetherAssembly” with
a link to the [project](https://github.com/AetherAssembly/aether-packages), is
appreciated and adds no license condition.
