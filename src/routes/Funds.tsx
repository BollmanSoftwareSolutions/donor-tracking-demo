import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import AddIcon from '@mui/icons-material/Add'
import PageHeader from '../components/PageHeader'
import AddFundDialog from '../components/AddFundDialog'
import { useFunds } from '../hooks/useApi'
import { formatCurrency } from '../components/format'

export default function Funds() {
  const { data, isLoading } = useFunds()
  const [addOpen, setAddOpen] = useState(false)
  const [addKey, setAddKey] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const openAdd = () => {
    setAddKey((k) => k + 1)
    setAddOpen(true)
  }

  return (
    <Box>
      <PageHeader
        title="Funds"
        subtitle="Designations that direct where donations are applied"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add fund
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Raised</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
              {data?.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={f.code} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={f.isRestricted ? 'Restricted' : 'Unrestricted'}
                      color={f.isRestricted ? 'secondary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(f.raisedAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <AddFundDialog
        key={addKey}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(name) => setToast(`Fund "${name}" created.`)}
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
