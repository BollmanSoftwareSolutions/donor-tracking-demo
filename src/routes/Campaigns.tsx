import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import PageHeader from '../components/PageHeader'
import { useCampaigns } from '../hooks/useApi'
import { formatCurrency } from '../components/format'
import type { CampaignStatus } from '../api/types'

const STATUS_COLOR: Record<CampaignStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  closed: 'default',
}

export default function Campaigns() {
  const { data, isLoading } = useCampaigns()

  return (
    <Box>
      <PageHeader
        title="Campaigns"
        subtitle="Track progress toward each campaign goal"
        action={
          <Button variant="contained" startIcon={<AddIcon />}>
            Add campaign
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(3, 1fr)',
          },
        }}
      >
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={180} />
          ))}
        {data?.map((c) => {
          const pct = Math.min(
            100,
            Math.round((c.raisedAmount / c.goalAmount) * 100),
          )
          return (
            <Card key={c.id}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Typography variant="h6">{c.name}</Typography>
                  <Chip
                    size="small"
                    label={c.status}
                    color={STATUS_COLOR[c.status]}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Stack>
                {c.groupName && (
                  <Chip
                    size="small"
                    label={c.groupName}
                    sx={{ mt: 0.5, mb: 1 }}
                  />
                )}
                <Box sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(c.raisedAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of {formatCurrency(c.goalAmount)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mt: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {pct}% of goal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.donorCount} donors
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
