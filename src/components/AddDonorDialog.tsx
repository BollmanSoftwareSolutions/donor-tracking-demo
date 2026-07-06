import { useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useCreateDonor } from '../hooks/useApi'
import type { NewDonorInput } from '../api/types'

interface AddDonorDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (donorName: string) => void
}

type DonorType = 'individual' | 'organization'

const TYPE_OPTIONS: Array<{ value: DonorType; label: string }> = [
  { value: 'individual', label: 'Individual' },
  { value: 'organization', label: 'Organization' },
]

const TAG_SUGGESTIONS = ['major-gift', 'recurring', 'board', 'volunteer', 'lapsed']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  type: DonorType
  name: string
  email: string
  tags: string[]
}

const initialForm = (): FormState => ({
  type: 'individual',
  name: '',
  email: '',
  tags: [],
})

export default function AddDonorDialog({
  open,
  onClose,
  onCreated,
}: AddDonorDialogProps) {
  const createDonor = useCreateDonor()
  const [form, setForm] = useState<FormState>(initialForm)
  const [touched, setTouched] = useState(false)

  const errors = useMemo(
    () => ({
      name: form.name.trim() ? '' : 'Enter a name',
      email: EMAIL_RE.test(form.email.trim())
        ? ''
        : 'Enter a valid email address',
    }),
    [form.name, form.email],
  )

  const isValid = !errors.name && !errors.email

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const nameLabel =
    form.type === 'organization' ? 'Organization name' : 'Full name'

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    const payload: NewDonorInput = {
      type: form.type,
      name: form.name.trim(),
      email: form.email.trim(),
      tags: form.tags,
    }
    createDonor.mutate(payload, {
      onSuccess: (donor) => {
        onCreated?.(donor.name)
        onClose()
      },
    })
  }

  const submitting = createDonor.isPending

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add donor</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            select
            required
            label="Type"
            value={form.type}
            onChange={(e) => set('type', e.target.value as DonorType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            label={nameLabel}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={touched && Boolean(errors.name)}
            helperText={touched ? errors.name : ' '}
          />

          <TextField
            required
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            error={touched && Boolean(errors.email)}
            helperText={touched ? errors.email : ' '}
          />

          <Autocomplete
            multiple
            freeSolo
            options={TAG_SUGGESTIONS}
            value={form.tags}
            onChange={(_, value) => set('tags', value as string[])}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index })
                return (
                  <Chip
                    key={key}
                    label={option}
                    size="small"
                    {...itemProps}
                  />
                )
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add a tag"
                helperText="Optional segmentation labels"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || (touched && !isValid)}
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {submitting ? 'Saving…' : 'Save donor'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
