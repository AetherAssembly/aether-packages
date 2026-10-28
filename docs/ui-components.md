# UI components

Import components and their public prop types from `@aetherAssembly/ui`, and load the stylesheet once:

```tsx
import { Button, Input, Textarea, Select, Checkbox, Field, Modal, Card, Badge, type ButtonProps } from '@aetherAssembly/ui'
import '@aetherAssembly/ui/styles.css'
```

Run `npm run gallery` from this repository for an interactive gallery with all variants, sizes, loading and error states, keyboard instructions, and theme overrides. The source is in `examples/gallery`. Run `npm run test:browser` for native Chromium dialog tests.

## Forms

Input, Textarea, Select, and Checkbox accept native element props and React 19 refs, plus optional `label`, `hint`, `error`, and `wrapperClassName`. `className` styles the control itself. IDs use React `useId()` unless explicitly supplied; labels do not need to be unique. Provide a label or another accessible naming attribute. Error text replaces hint text, sets aria-invalid, and joins caller-provided aria-describedby references. Caller aria-invalid is preserved when no error is present.

```tsx
<Input label="Name" hint="Display name" required />
<Textarea label="Notes" rows={5} />
<Select label="Category" defaultValue="personal">
  <option value="personal">Personal</option>
  <option value="work">Work</option>
</Select>
<Checkbox label="Receive updates" />
<Field label="Custom control" hint="Choose a value">
  {attributes => <input {...attributes} type="range" />}
</Field>
```

Checkbox always renders type=checkbox. Select uses native options and keyboard behavior. Field exposes id, aria-describedby, and aria-invalid through a render function for custom controls. With static children, explicitly provide matching IDs and accessibility attributes yourself.

**Migration:** Input IDs no longer derive from labels, and className now applies to the input; move previous wrapper styles to wrapperClassName. Use explicit IDs for external links or selectors.

## Button

Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. `loading` always disables the button and sets aria-busy, even with disabled=false. The default type is button; specify type=submit for form submission. Native props and refs are supported. ButtonProps, ButtonVariant, and ButtonSize are exported.

## Modal

`open` controls visibility and `onClose` requests that the owner set open=false. Close button, Escape, backdrop clicks, and native dialog close actions notify once per open cycle. Prop-driven closing does not notify. A title is linked with aria-labelledby; aria-label or aria-labelledby can override it, and untitled dialogs default to "Dialog". Prefer an explicit meaningful name. The close button is always present. Native dialog props (including onCancel to prevent dismissal) pass through. Native showModal provides focus containment and restores focus on close; browser tests verify this behavior.

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Confirm">
  <p>Continue?</p>
  <Button onClick={confirm}>Continue</Button>
</Modal>
```

## Card and Badge

Card accepts header/footer slots, children, className, and native article attributes. Badge variants are default, success, warning, danger, and info; native span attributes pass through. CardProps, BadgeProps, and BadgeVariant are exported.

## Themes and styles

Override `--ae-*` custom properties on :root or a containing theme element. See `packages/ui/src/styles.css` for the complete token list: colors, surfaces, text, spacing, typography, radius, shadows, and transitions. Import the stylesheet before your overrides. Badge colors derive from status tokens; review their contrast with your app's palette. Keyboard focus styles are provided, and reduced-motion preferences disable transitions and spinner rotation.

```css
.dark {
  --ae-color-bg: #111827;
  --ae-color-surface: #1f2937;
  --ae-color-text: #f9fafb;
  --ae-color-text-muted: #d1d5db;
  --ae-color-border: #4b5563;
}
```
