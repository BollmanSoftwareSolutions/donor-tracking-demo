import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
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

  return (
    <Box>
      <PageHeader
        title="Receipts"
        subtitle="Per-donation receipts and annual statements"
        action={
          <Button variant="contained" startIcon={<ReceiptLongOutlinedIcon />}>
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
    </Box>
  )
}
