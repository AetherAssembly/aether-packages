# UI Components

`@aetherAssembly/ui` is a small React 19 component library. Components are built on semantic HTML elements, styled entirely with CSS custom properties (`--ae-*`), and use BEM-style class names scoped to the `ae-` prefix.

---

## Using the stylesheet

The package ships `src/styles.css` which defines the default `--ae-*` token values. Import it once at your app root, or override only the tokens you need in your own stylesheet:

```ts
// vite / bundler entry
import '@aetherAssembly/ui/src/styles.css'
```

If you don't import the stylesheet, tokens will be unset and components will be unstyled. You can also skip the import entirely and define all tokens yourself.

---

## CSS token reference

All visual styling in every component references these tokens. Override any of them in `:root` to theme the entire library.

### Colors

| Token | Default | Usage |
| - | - | - |
| `--ae-color-primary` | `#6366f1` | Primary button background, focus rings, active states |
| `--ae-color-primary-hover` | `#4f46e5` | Primary hover state |
| `--ae-color-primary-active` | `#4338ca` | Primary active/pressed state |
| `--ae-color-primary-fg` | `#ffffff` | Text on primary backgrounds |
| `--ae-color-secondary` | `#e5e7eb` | Secondary button background |
| `--ae-color-secondary-hover` | `#d1d5db` | Secondary hover state |
| `--ae-color-secondary-fg` | `#111827` | Text on secondary backgrounds |
| `--ae-color-danger` | `#ef4444` | Danger button background, error states |
| `--ae-color-danger-hover` | `#dc2626` | Danger hover state |
| `--ae-color-danger-fg` | `#ffffff` | Text on danger backgrounds |
| `--ae-color-success` | `#22c55e` | Success badge, positive indicators |
| `--ae-color-warning` | `#f59e0b` | Warning badge, caution indicators |
| `--ae-color-info` | `#3b82f6` | Info badge |
| `--ae-color-bg` | `#ffffff` | Component background (cards, modals) |
| `--ae-color-surface` | `#f9fafb` | Subtle surface (input backgrounds) |
| `--ae-color-border` | `#e5e7eb` | Default borders |
| `--ae-color-border-focus` | `#6366f1` | Focus ring color |
| `--ae-color-text` | `#111827` | Primary text |
| `--ae-color-text-muted` | `#6b7280` | Secondary/hint text |
| `--ae-color-text-placeholder` | `#9ca3af` | Input placeholder text |

### Spacing

| Token | Value |
| - | - |
| `--ae-space-1` | `0.25rem` |
| `--ae-space-2` | `0.5rem` |
| `--ae-space-3` | `0.75rem` |
| `--ae-space-4` | `1rem` |
| `--ae-space-6` | `1.5rem` |
| `--ae-space-8` | `2rem` |

### Typography

| Token | Default |
| - | - |
| `--ae-font-sans` | `system-ui, -apple-system, sans-serif` |
| `--ae-font-size-sm` | `0.875rem` |
| `--ae-font-size-base` | `1rem` |
| `--ae-font-size-lg` | `1.125rem` |
| `--ae-line-height-tight` | `1.25` |
| `--ae-line-height-normal` | `1.5` |

### Radius

| Token | Value |
| - | - |
| `--ae-radius-sm` | `0.25rem` |
| `--ae-radius-md` | `0.375rem` |
| `--ae-radius-lg` | `0.5rem` |
| `--ae-radius-full` | `9999px` |

### Shadows

| Token | Value |
| - | - |
| `--ae-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--ae-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--ae-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

### Transitions

| Token | Value |
| - | - |
| `--ae-transition-fast` | `100ms ease` |
| `--ae-transition-base` | `150ms ease` |

---

## Theming

Override tokens in your app's `:root` block. You only need to set the tokens you want to change — everything else falls back to the defaults from `styles.css`.

**Example — mapping Attyre's warm palette:**

```css
:root {
  --ae-color-primary:        var(--gold);
  --ae-color-primary-hover:  var(--gold-dark);
  --ae-color-primary-fg:     #ffffff;
  --ae-color-secondary:      var(--stone-mid);
  --ae-color-secondary-fg:   var(--ink);
  --ae-color-danger:         var(--error);
  --ae-color-bg:             var(--bg-surface);
  --ae-color-surface:        var(--bg-subtle);
  --ae-color-text:           var(--text-primary);
  --ae-color-text-muted:     var(--text-muted);
  --ae-color-border:         var(--border);
  --ae-color-border-focus:   var(--gold);
  --ae-font-sans:            var(--font);
  --ae-radius-md:            var(--radius-md);
}
```

Dark mode works the same way — redefine tokens inside a `.dark-mode` or `@media (prefers-color-scheme: dark)` block.

---

## Component reference

### `Button`

```tsx
import { Button } from '@aetherAssembly/ui'

<Button variant="primary" size="md" onClick={save}>Save</Button>
<Button variant="danger" loading={isDeleting}>Delete</Button>
<Button variant="ghost" size="sm" disabled>Unavailable</Button>
```

**Props:**

| Prop | Type | Default | Description |
| - | - | - | - |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `loading` | `boolean` | `false` | Shows a spinner, sets `aria-busy`, disables the button |
| `...rest` | `ButtonHTMLAttributes` | — | Passed through to `<button>` |

When `loading` is `true`, `disabled` is forced to `true` and `aria-busy` is set. You don't need to set `disabled` separately.

**CSS classes:** `ae-btn`, `ae-btn--{variant}`, `ae-btn--{size}`, `ae-btn__spinner`

---

### `Card`

```tsx
import { Card } from '@aetherAssembly/ui'

<Card
  header={<h2>Title</h2>}
  footer={<Button size="sm">Action</Button>}
>
  <p>Card body content.</p>
</Card>
```

**Props:**

| Prop | Type | Description |
| - | - | - |
| `header` | `ReactNode` | Optional header slot, rendered above the body |
| `footer` | `ReactNode` | Optional footer slot, rendered below the body |
| `children` | `ReactNode` | Body content |
| `className` | `string` | Merged onto the root element |

**CSS classes:** `ae-card`, `ae-card__header`, `ae-card__body`, `ae-card__footer`

---

### `Badge`

```tsx
import { Badge } from '@aetherAssembly/ui'

<Badge variant="success">Fresh</Badge>
<Badge variant="warning">Expiring soon</Badge>
<Badge variant="danger">Expired</Badge>
```

**Props:**

| Prop | Type | Default | Description |
| - | - | - | - |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Colour scheme |
| `children` | `ReactNode` | — | Badge label |
| `className` | `string` | — | Merged onto the root element |

**CSS classes:** `ae-badge`, `ae-badge--{variant}`

---

### `Input`

```tsx
import { Input } from '@aetherAssembly/ui'

<Input
  label="City"
  hint="e.g. Tokyo Japan"
  error={errors.city}
  value={city}
  onChange={e => setCity(e.target.value)}
/>
```

**Props:**

| Prop | Type | Description |
| - | - | - |
| `label` | `string` | Required. Rendered as `<label>` and used to generate the `id` if one isn't provided. |
| `error` | `string` | If set, rendered as error text below the input and `aria-invalid="true"` is applied. |
| `hint` | `string` | Rendered as muted helper text below the input (below the error if both are set). |
| `...rest` | `InputHTMLAttributes` | Passed through to `<input>`. |

The `id` is auto-generated from the label by lowercasing and replacing spaces with hyphens (`"My Field"` → `"my-field"`). Pass an explicit `id` prop to override.

**CSS classes:** `ae-input-group`, `ae-input-group__label`, `ae-input-group__input`, `ae-input-group__error`, `ae-input-group__hint`

---

### `Modal`

```tsx
import { Modal } from '@aetherAssembly/ui'

<Modal
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm deletion"
>
  <p>This cannot be undone.</p>
  <Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal>
```

**Props:**

| Prop | Type | Description |
| - | - | - |
| `open` | `boolean` | Controls visibility. The component calls `showModal()` / `close()` on the `<dialog>` in response to changes. |
| `onClose` | `() => void` | Called when the dialog closes — via the close button, `Escape` key, or clicking the backdrop. |
| `title` | `string` | Optional. Renders a header with a close button. |
| `children` | `ReactNode` | Body content. |
| `className` | `string` | Merged onto the `<dialog>` element. |

**How it works:**

Wraps the native `<dialog>` element. `showModal()` gives you browser-native focus trapping, `Escape` to close, and the `::backdrop` pseudo-element for the overlay — no JS needed for any of that. Clicking directly on the `<dialog>` (i.e. the backdrop area outside the content) calls `onClose`. The `close` event on the dialog also calls `onClose`, which covers the `Escape` key case.

**CSS classes:** `ae-modal`, `ae-modal__content`, `ae-modal__header`, `ae-modal__title`, `ae-modal__close`, `ae-modal__body`

---

## Adding a new component

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-new-component-to-aetherAssemblyui) for the step-by-step. Key rules:

- BEM class names under `ae-`
- All styling via `--ae-*` tokens in `styles.css` — no hardcoded values
- Props extend the underlying HTML element's attribute type and spread `...rest`
- Accessibility first: correct roles, `aria-*` attributes, keyboard support
