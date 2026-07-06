import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PageHeader from '../components/PageHeader'
import { useReceipts } from '../hooks/useApi'
import { formatCurrency, formatDate } from '../components/format'
import type { Receipt } from '../api/types'

const EMAIL_COLOR: Record<Receipt['emailStatus'], 'success' | 'warning' | 'error'> = {
  sent: 'success',
  pending: 'warning',
  failed: 'error',
}

export default function Receipts() {
  const { data, isLoading } = useReceipts()
  const [batchOpen, setBatchOpen] = useState(false)

  return (
    <Box>
      <PageHeader
        title="Receipts"
        subtitle="Per-donation receipts and annual statements"
        action={
          <Button
            variant="contained"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={() => setBatchOpen(true)}
          >
            Run annual batch
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Donor</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  Kind
                </TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Delivery</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Issued
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
              {data?.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.number}</TableCell>
                  <TableCell>{r.donorName}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {r.kind === 'per_donation'
                      ? 'Per-donation'
                      : 'Annual statement'}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(r.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.emailStatus}
                      color={EMAIL_COLOR[r.emailStatus]}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {formatDate(r.issuedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Run annual batch</DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
            }}
          >
            <ConstructionOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h6">Coming soon</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 460 }}
            >
              Annual statement batch generation is part of the design
              specification and will be implemented in a later iteration.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setBatchOpen(false)} variant="contained">
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
