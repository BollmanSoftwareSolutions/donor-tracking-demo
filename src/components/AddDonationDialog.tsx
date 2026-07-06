import { useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useCampaigns, useCreateDonation, useDonors, useFunds } from '../hooks/useApi'
import type { DonationType, NewDonationInput } from '../api/types'

interface AddDonationDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (donorName: string) => void
}

const DONATION_TYPE_OPTIONS: Array<{ value: DonationType; label: string }> = [
  { value: 'monetary_online', label: 'Online monetary' },
  { value: 'offline_cash_check', label: 'Offline cash/check' },
  { value: 'in_kind', label: 'In-kind' },
]

const todayIso = () => new Date().toISOString().slice(0, 10)

interface FormState {
  donorId: string
  type: DonationType
  amount: string
  receivedAt: string
  campaignId: string
  fundId: string
  note: string
}

const initialForm = (): FormState => ({
  donorId: '',
  type: 'monetary_online',
  amount: '',
  receivedAt: todayIso(),
  campaignId: '',
  fundId: '',
  note: '',
})

export default function AddDonationDialog({
  open,
  onClose,
  onCreated,
}: AddDonationDialogProps) {
  const { data: donors } = useDonors()
  const { data: campaigns } = useCampaigns()
  const { data: funds } = useFunds()
  const createDonation = useCreateDonation()

  const [form, setForm] = useState<FormState>(initialForm)
  const [touched, setTouched] = useState(false)

  const amountValue = Number(form.amount)
  const errors = useMemo(() => {
    return {
      donorId: form.donorId ? '' : 'Select a donor',
      amount:
        form.amount === '' || Number.isNaN(amountValue) || amountValue <= 0
          ? 'Enter an amount greater than 0'
          : '',
      receivedAt:
        !form.receivedAt || form.receivedAt > todayIso()
          ? 'Choose a date no later than today'
          : '',
    }
  }, [form.donorId, form.amount, form.receivedAt, amountValue])

  const isValid = !errors.donorId && !errors.amount && !errors.receivedAt

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const amountLabel = form.type === 'in_kind' ? 'Fair-market value' : 'Amount'

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    const payload: NewDonationInput = {
      donorId: form.donorId,
      type: form.type,
      amount: amountValue,
      receivedAt: form.receivedAt,
      campaignId: form.campaignId || null,
      fundId: form.fundId || null,
      note: form.note.trim() || undefined,
    }
    createDonation.mutate(payload, {
      onSuccess: (donation) => {
        onCreated?.(donation.donorName)
        onClose()
      },
    })
  }

  const submitting = createDonation.isPending

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add donation</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            select
            required
            label="Donor"
            value={form.donorId}
            onChange={(e) => set('donorId', e.target.value)}
            error={touched && Boolean(errors.donorId)}
            helperText={touched ? errors.donorId : ' '}
          >
            {(donors ?? []).map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            label="Type"
            value={form.type}
            onChange={(e) => set('type', e.target.value as DonationType)}
          >
            {DONATION_TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              required
              label={amountLabel}
              type="number"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              error={touched && Boolean(errors.amount)}
              helperText={touched ? errors.amount : ' '}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
                htmlInput: { min: 0, step: '0.01' },
              }}
              sx={{ flex: 1, minWidth: 160 }}
            />
            <TextField
              required
              label="Date received"
              type="date"
              value={form.receivedAt}
              onChange={(e) => set('receivedAt', e.target.value)}
              error={touched && Boolean(errors.receivedAt)}
              helperText={touched ? errors.receivedAt : ' '}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: todayIso() },
              }}
              sx={{ flex: 1, minWidth: 160 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Campaign"
              value={form.campaignId}
              onChange={(e) => set('campaignId', e.target.value)}
              sx={{ flex: 1, minWidth: 160 }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {(campaigns ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Fund"
              value={form.fundId}
              onChange={(e) => set('fundId', e.target.value)}
              sx={{ flex: 1, minWidth: 160 }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {(funds ?? []).map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Note"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            multiline
            minRows={2}
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
            submitting ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {submitting ? 'Saving…' : 'Save donation'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
