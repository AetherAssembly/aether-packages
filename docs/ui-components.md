# Build an interface with `@aetherAssembly/ui`

Use the components for common forms, actions, status labels, cards, and dialogs in a React 19 app. Install the package with its React peers, then import the stylesheet once:

```sh
npm install @aetherAssembly/ui react@^19 react-dom@^19
```

```tsx
import { Button, Input } from '@aetherAssembly/ui'
import '@aetherAssembly/ui/styles.css'

export function NameForm() {
  return (
    <form>
      <Input label="Name" name="name" required />
      <Button type="submit">Save</Button>
    </form>
  )
}
```

The stylesheet supplies default `--ae-*` tokens. Import it before your own theme overrides.

## Explore before building

Run `npm run gallery` from the repository root to try each component, loading and error states, keyboard behavior, and theme overrides. The gallery source is in `examples/gallery`. Run `npm run test:browser` for the native Chromium dialog tests.

## Choose a component

| Component  | Use it for                                      |
| ---------- | ----------------------------------------------- |
| `Button`   | An action, form submission, or loading state    |
| `Input`    | Single-line text or another native input type   |
| `Textarea` | Multiline text                                  |
| `Select`   | A choice using native `<option>` elements       |
| `Checkbox` | A native checkbox with a label                  |
| `Field`    | A label, hint, or error around a custom control |
| `Modal`    | A controlled native dialog                      |
| `Card`     | Content with optional header and footer         |
| `Badge`    | A short status label                            |

Components pass through supported native attributes. Public prop types, including `ButtonProps`, are exported with their components.

## Build accessible forms

Give each control a visible label or another accessible name. Use `hint` for instructions and `error` for a validation message:

```tsx
<Input label="Name" hint="Display name" required />
<Textarea label="Notes" rows={5} />
<Select label="Category" defaultValue="personal">
  <option value="personal">Personal</option>
  <option value="work">Work</option>
</Select>
<Checkbox label="Receive updates" />
<Field label="Custom control" hint="Choose a value">
  {(attributes) => <input {...attributes} type="range" />}
</Field>
```

`Input`, `Textarea`, `Select`, and `Checkbox` accept native element props and React 19 refs. They also support `label`, `hint`, `error`, and `wrapperClassName`. Use `className` to style the control itself.

Controls generate IDs with React `useId()` unless you provide one. Labels do not need to be unique. An error replaces the hint, sets `aria-invalid`, and is connected through `aria-describedby`. Caller-provided description references are retained, and caller-provided `aria-invalid` is preserved when there is no error.

`Checkbox` always renders `type="checkbox"`. `Select` uses native options and keyboard behavior. `Field` passes `id`, `aria-describedby`, and `aria-invalid` to a custom control through its render function. If you use static children instead, provide matching IDs and accessibility attributes yourself.

### Update from an earlier Input API

Input IDs no longer derive from labels, and `className` styles the input itself. Move styles that previously targeted the wrapper to `wrapperClassName`. Supply an explicit ID if external links or selectors relied on the old label-derived ID.

## Choose button behavior

Button variants are `primary`, `secondary`, `ghost`, and `danger`. Sizes are `sm`, `md`, and `lg`. Loading disables the button and sets `aria-busy`, including when `disabled={false}`:

```tsx
<Button variant="primary" size="md" onClick={save}>
  Save
</Button>
<Button variant="danger" loading={deleting}>
  Delete
</Button>
```

The default type is `button`, so a button does not submit a form unless you set `type="submit"`. `ButtonProps`, `ButtonVariant`, and `ButtonSize` are exported.

## Keep dialogs under app control

The owner of a `Modal` controls its `open` prop. Treat `onClose` as a request to dismiss the dialog and update your state in the handler:

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
  <p>Continue?</p>
  <Button onClick={confirm}>Continue</Button>
</Modal>
```

The close button, Escape, backdrop clicks, and native dialog close actions request dismissal once per open cycle. Closing through the `open` prop does not call `onClose`. The title is connected with `aria-labelledby`; `aria-label` or `aria-labelledby` can override it. For an untitled dialog, provide a meaningful name. The fallback name is “Dialog”.

A close button is always present. Native dialog props pass through, including `onCancel` if your app needs to prevent Escape dismissal. `showModal()` provides focus containment and restores focus after the dialog closes. Browser tests cover this behavior.

## Add content and status

`Card` accepts `header`, `footer`, children, `className`, and native article attributes. `Badge` variants are `default`, `success`, `warning`, `danger`, and `info`; native span attributes pass through. `CardProps`, `BadgeProps`, and `BadgeVariant` are exported.

## Match your app's theme

Import the package stylesheet before your overrides. Set tokens on `:root` to theme the app, or on a containing element to theme one section:

```css
.dark {
  --ae-color-bg: #111827;
  --ae-color-surface: #1f2937;
  --ae-color-text: #f9fafb;
  --ae-color-text-muted: #d1d5db;
  --ae-color-border: #4b5563;
}
```

The full token list is in [`packages/ui/src/styles.css`](../packages/ui/src/styles.css). It covers colors, surfaces, text, spacing, typography, radius, shadows, and transitions. Badge colors use status tokens, so check their contrast with your palette. Components provide keyboard focus styles, and reduced-motion preferences disable transitions and spinner rotation.
