import { useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useCampaigns, useCreateCampaign } from '../hooks/useApi'
import type { CampaignStatus, NewCampaignInput } from '../api/types'

interface AddCampaignDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (campaignName: string) => void
}

const STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
]

interface FormState {
  name: string
  groupName: string
  goalAmount: string
  status: CampaignStatus
}

const initialForm = (): FormState => ({
  name: '',
  groupName: '',
  goalAmount: '',
  status: 'draft',
})

export default function AddCampaignDialog({
  open,
  onClose,
  onCreated,
}: AddCampaignDialogProps) {
  const { data: campaigns } = useCampaigns()
  const createCampaign = useCreateCampaign()

  const [form, setForm] = useState<FormState>(initialForm)
  const [touched, setTouched] = useState(false)

  const groupOptions = useMemo(() => {
    const names = (campaigns ?? [])
      .map((c) => c.groupName)
      .filter((g): g is string => Boolean(g))
    return Array.from(new Set(names))
  }, [campaigns])

  const goalValue = Number(form.goalAmount)
  const errors = useMemo(
    () => ({
      name: form.name.trim() ? '' : 'Enter a campaign name',
      goalAmount:
        form.goalAmount === '' || Number.isNaN(goalValue) || goalValue <= 0
          ? 'Enter a goal greater than 0'
          : '',
    }),
    [form.name, form.goalAmount, goalValue],
  )

  const isValid = !errors.name && !errors.goalAmount

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    const payload: NewCampaignInput = {
      name: form.name.trim(),
      groupName: form.groupName.trim() || null,
      goalAmount: goalValue,
      status: form.status,
    }
    createCampaign.mutate(payload, {
      onSuccess: (campaign) => {
        onCreated?.(campaign.name)
        onClose()
      },
    })
  }

  const submitting = createCampaign.isPending

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add campaign</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            required
            label="Campaign name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={touched && Boolean(errors.name)}
            helperText={touched ? errors.name : ' '}
          />

          <Autocomplete
            freeSolo
            options={groupOptions}
            value={form.groupName}
            onChange={(_, value) => set('groupName', value ?? '')}
            onInputChange={(_, value) => set('groupName', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Campaign group"
                placeholder="Standalone (no group)"
                helperText="Optional — leave blank for a standalone campaign"
              />
            )}
          />

          <TextField
            required
            label="Goal amount"
            type="number"
            value={form.goalAmount}
            onChange={(e) => set('goalAmount', e.target.value)}
            error={touched && Boolean(errors.goalAmount)}
            helperText={touched ? errors.goalAmount : ' '}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
              htmlInput: { min: 0, step: '100' },
            }}
          />

          <TextField
            select
            required
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as CampaignStatus)}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
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
          {submitting ? 'Saving…' : 'Save campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
