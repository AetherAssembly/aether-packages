import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from '../../packages/ui/src/index'
import '../../packages/ui/src/styles.css'
import './styles.css'

function Gallery() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  return (
    <main className={dark ? 'gallery dark' : 'gallery'}>
      <h1>Aether UI</h1>
      <p>
        Use Tab to explore controls, Space to toggle checkboxes, and Escape to
        dismiss dialogs.
      </p>
      <Checkbox
        label="Dark theme"
        checked={dark}
        onChange={(e) => setDark(e.target.checked)}
      />
      <Card header={<h2>Buttons and status</h2>}>
        <div className="row">
          {(['primary', 'secondary', 'ghost', 'danger'] as const).map(
            (variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ),
          )}
        </div>
        <div className="row">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button disabled>Disabled</Button>
          <Button loading={loading}>Save</Button>
        </div>
        <Checkbox
          label="Loading state"
          checked={loading}
          onChange={(e) => setLoading(e.target.checked)}
        />
        <div className="row">
          {(['default', 'success', 'warning', 'danger', 'info'] as const).map(
            (variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ),
          )}
        </div>
      </Card>
      <Card header={<h2>Form controls</h2>}>
        <Checkbox
          label="Show validation error"
          checked={error}
          onChange={(e) => setError(e.target.checked)}
        />
        <Input
          label="Name"
          hint="Your display name"
          {...(error ? { error: 'Enter a name' } : {})}
        />
        <Textarea label="Notes" hint="Optional details" />
        <Select label="Category">
          <option>Personal</option>
          <option>Work</option>
        </Select>
        <Checkbox label="Receive updates" hint="You can change this later" />
        <Input label="Unavailable" disabled value="Read only example" />
      </Card>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example dialog">
        <Input label="Dialog field" />
        <Button onClick={() => setOpen(false)}>Done</Button>
      </Modal>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Gallery />)
