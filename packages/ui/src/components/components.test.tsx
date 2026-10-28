import { createRef, useState } from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Field,
  Card,
  Badge,
  Modal,
} from '../index.js'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})
it('disables loading buttons even with disabled=false and forwards refs', async () => {
  const onClick = vi.fn()
  const ref = createRef<HTMLButtonElement>()
  render(
    <Button ref={ref} loading disabled={false} onClick={onClick}>
      Save
    </Button>,
  )
  await userEvent.click(screen.getByRole('button'))
  expect(onClick).not.toHaveBeenCalled()
  expect(ref.current).toHaveAttribute('type', 'button')
  expect(ref.current).toHaveAttribute('aria-busy', 'true')
})
it('supports explicit submit buttons and variants', () => {
  render(
    <Button type="submit" variant="danger" size="sm">
      Delete
    </Button>,
  )
  expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  expect(screen.getByRole('button')).toHaveClass('ae-btn--danger', 'ae-btn--sm')
})
describe('fields', () => {
  it('generates unique IDs and points labels at the right input', () => {
    render(
      <>
        <Input label="Name" />
        <Input label="Name" />
        <Input hint="Unlabelled helper" aria-label="Other" />
      </>,
    )
    const fields = screen.getAllByLabelText('Name')
    expect(fields[0]?.id).not.toBe(fields[1]?.id)
    expect(screen.getByLabelText('Other')).toHaveAccessibleDescription(
      'Unlabelled helper',
    )
  })
  it('merges descriptions, hides hints on error, and preserves caller invalid state', () => {
    const { rerender } = render(
      <>
        <p id="external">External</p>
        <Input
          label="Name"
          id="name"
          error="Required"
          hint="Hidden"
          aria-describedby="external"
        />
      </>,
    )
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription(
      'External Required',
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    rerender(<Input label="Name" aria-invalid="grammar" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-invalid',
      'grammar',
    )
  })
  it('supports refs, native editing, select options and checkbox labels', async () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <>
        <Input ref={ref} label="Name" className="custom" />
        <Textarea label="Notes" />
        <Select label="Category">
          <option value="a">A</option>
          <option value="b">B</option>
        </Select>
        <Checkbox label="Agree" />
      </>,
    )
    await userEvent.type(screen.getByLabelText('Name'), 'Aster')
    await userEvent.type(screen.getByLabelText('Notes'), 'Notes')
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'b')
    await userEvent.click(screen.getByLabelText('Agree'))
    expect(ref.current).toHaveValue('Aster')
    expect(ref.current).toHaveClass('custom')
    expect(screen.getByLabelText('Category')).toHaveValue('b')
    expect(screen.getByLabelText('Agree')).toBeChecked()
  })
  it('exposes Field attributes for custom controls', () => {
    render(
      <Field label="Custom" hint="Help">
        {(attributes) => <input {...attributes} />}
      </Field>,
    )
    expect(screen.getByLabelText('Custom')).toHaveAccessibleDescription('Help')
  })
})
it('renders card slots and badge attributes', () => {
  render(
    <Card header="Header" footer="Footer" data-testid="card">
      <Badge variant="success" title="Status">
        Synced
      </Badge>
    </Card>,
  )
  expect(screen.getByText('Header')).toBeVisible()
  expect(screen.getByText('Footer')).toBeVisible()
  expect(screen.getByTitle('Status')).toHaveClass('ae-badge--success')
})
it('names dialogs and notifies once per user close request', async () => {
  const onClose = vi.fn()
  function Example() {
    const [open, setOpen] = useState(true)
    return (
      <Modal
        open={open}
        title="Confirm"
        onClose={() => {
          onClose()
          setOpen(false)
        }}
      >
        Body
      </Modal>
    )
  }
  render(<Example />)
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Confirm')
  await userEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(onClose).toHaveBeenCalledOnce()
})
it('does not notify for prop-driven close; supports untitled accessible names and cancel', () => {
  const onClose = vi.fn()
  const { rerender } = render(
    <Modal open onClose={onClose} aria-label="Settings">
      Body
    </Modal>,
  )
  const dialog = screen.getByRole('dialog', { name: 'Settings' })
  rerender(
    <Modal open={false} onClose={onClose}>
      Body
    </Modal>,
  )
  expect(onClose).not.toHaveBeenCalled()
  rerender(
    <Modal open onClose={onClose} aria-label="Settings">
      Body
    </Modal>,
  )
  fireEvent(dialog, new Event('cancel', { cancelable: true }))
  expect(onClose).toHaveBeenCalledOnce()
})
