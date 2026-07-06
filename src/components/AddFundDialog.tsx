import { useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { useCreateFund } from '../hooks/useApi'
import type { NewFundInput } from '../api/types'

interface AddFundDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (fundName: string) => void
}

interface FormState {
  name: string
  code: string
  isRestricted: boolean
}

const initialForm = (): FormState => ({
  name: '',
  code: '',
  isRestricted: false,
})

export default function AddFundDialog({
  open,
  onClose,
  onCreated,
}: AddFundDialogProps) {
  const createFund = useCreateFund()
  const [form, setForm] = useState<FormState>(initialForm)
  const [touched, setTouched] = useState(false)

  const errors = useMemo(
    () => ({
      name: form.name.trim() ? '' : 'Enter a fund name',
      code: form.code.trim() ? '' : 'Enter a short code',
    }),
    [form.name, form.code],
  )

  const isValid = !errors.name && !errors.code

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    const payload: NewFundInput = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      isRestricted: form.isRestricted,
    }
    createFund.mutate(payload, {
      onSuccess: (fund) => {
        onCreated?.(fund.name)
        onClose()
      },
    })
  }

  const submitting = createFund.isPending

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add fund</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            required
            label="Fund name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={touched && Boolean(errors.name)}
            helperText={touched ? errors.name : ' '}
          />

          <TextField
            required
            label="Code"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            error={touched && Boolean(errors.code)}
            helperText={
              touched && errors.code
                ? errors.code
                : 'Short identifier, e.g. GEN or SCH'
            }
            slotProps={{ htmlInput: { maxLength: 8, style: { textTransform: 'uppercase' } } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isRestricted}
                onChange={(e) => set('isRestricted', e.target.checked)}
              />
            }
            label="Restricted fund"
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
          {submitting ? 'Saving…' : 'Save fund'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
