import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import PageHeader from '../components/PageHeader'
import { useDonations } from '../hooks/useApi'
import { formatCurrency, formatDate } from '../components/format'
import { DONATION_TYPE_LABEL, type DonationStatus } from '../api/types'

const STATUS_COLOR: Record<DonationStatus, 'success' | 'default' | 'error' | 'warning'> = {
  settled: 'success',
  recorded: 'default',
  refunded: 'error',
  voided: 'warning',
}

export default function Donations() {
  const { data, isLoading } = useDonations()
  const [typeFilter, setTypeFilter] = useState('all')

  const rows = useMemo(() => {
    if (!data) return []
    return typeFilter === 'all'
      ? data
      : data.filter((d) => d.type === typeFilter)
  }, [data, typeFilter])

  return (
    <Box>
      <PageHeader
        title="Donations"
        subtitle="All recorded gifts across types and campaigns"
        action={
          <Button variant="contained" startIcon={<AddIcon />}>
            Add donation
          </Button>
        }
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          select
          size="small"
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All types</MenuItem>
          <MenuItem value="monetary_online">Online monetary</MenuItem>
          <MenuItem value="offline_cash_check">Offline cash/check</MenuItem>
          <MenuItem value="in_kind">In-kind</MenuItem>
        </TextField>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Donor</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  Type
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Campaign
                </TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                rows.slice(0, 60).map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.donorName}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {DONATION_TYPE_LABEL[d.type]}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {d.campaignName ?? '—'}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(d.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={d.status}
                        color={STATUS_COLOR[d.status]}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {formatDate(d.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No donations match the selected filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
