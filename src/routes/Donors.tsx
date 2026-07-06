import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import PageHeader from '../components/PageHeader'
import AddDonorDialog from '../components/AddDonorDialog'
import { useDonors } from '../hooks/useApi'
import { formatCurrency, formatDate } from '../components/format'

export default function Donors() {
  const { data, isLoading } = useDonors()
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addKey, setAddKey] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const openAdd = () => {
    setAddKey((k) => k + 1)
    setAddOpen(true)
  }

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const rows = q
      ? data.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q),
        )
      : data
    return [...rows].sort((a, b) => b.lifetimeValue - a.lifetimeValue)
  }, [data, query])

  return (
    <Box>
      <PageHeader
        title="Donors"
        subtitle="Search and manage your organization's donors"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add donor
          </Button>
        }
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Type
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  Email
                </TableCell>
                <TableCell align="right">Lifetime value</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Last gift
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                filtered.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {d.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {d.tags.map((t) => (
                            <Chip
                              key={t}
                              label={t}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 11 }}
                            />
                          ))}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip
                        size="small"
                        label={d.type}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      {d.email}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(d.lifetimeValue)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {d.lastGiftAt ? formatDate(d.lastGiftAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No donors match your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <AddDonorDialog
        key={addKey}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(donorName) => setToast(`Donor ${donorName} added.`)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  )
}
