import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import { useDashboard } from '../hooks/useApi'
import { chartPalette } from '../theme'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
} from '../components/format'
import { DONATION_TYPE_LABEL } from '../api/types'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Year-to-date giving overview for the active organization"
      />

      {/* KPI cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          },
          mb: 3,
        }}
      >
        <KpiCard
          label="YTD donations"
          value={data ? formatCurrency(data.kpis.ytdTotal) : '—'}
          icon={AttachMoneyIcon}
          loading={isLoading}
        />
        <KpiCard
          label="Total donors"
          value={data?.kpis.donorCount ?? '—'}
          icon={PeopleAltOutlinedIcon}
          loading={isLoading}
          color={chartPalette[1]}
        />
        <KpiCard
          label="Average gift"
          value={data ? formatCurrency(data.kpis.avgGift) : '—'}
          icon={CardGiftcardOutlinedIcon}
          loading={isLoading}
          color={chartPalette[4]}
        />
        <KpiCard
          label="Active campaigns"
          value={data?.kpis.activeCampaigns ?? '—'}
          icon={CampaignOutlinedIcon}
          loading={isLoading}
          color={chartPalette[5]}
        />
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          mb: 3,
        }}
      >
        <ChartCard
          title="Year-to-date donations"
          subheader="Monthly giving total"
          loading={isLoading}
        >
          {data && (
            <LineChart
              height={300}
              xAxis={[
                {
                  scaleType: 'point',
                  data: data.monthlyTotals.map((m) => m.month),
                },
              ]}
              yAxis={[
                {
                  valueFormatter: (v: number) => formatCompactCurrency(v),
                  width: 60,
                },
              ]}
              series={[
                {
                  data: data.monthlyTotals.map((m) => m.total),
                  label: 'Donations',
                  area: true,
                  color: chartPalette[0],
                  valueFormatter: (v) => (v == null ? '' : formatCurrency(v)),
                },
              ]}
              margin={{ top: 10, right: 16, bottom: 24, left: 0 }}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Donation type mix"
          subheader="Share of total giving"
          loading={isLoading}
        >
          {data && (
            <PieChart
              height={300}
              series={[
                {
                  innerRadius: 55,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  data: data.donationTypeShares.map((s, i) => ({
                    id: s.type,
                    value: s.total,
                    label: DONATION_TYPE_LABEL[s.type],
                    color: chartPalette[i],
                  })),
                  valueFormatter: (item) => formatCurrency(item.value),
                },
              ]}
              slotProps={{
                legend: {
                  direction: 'horizontal',
                  position: { vertical: 'bottom', horizontal: 'center' },
                },
              }}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
          )}
        </ChartCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <ChartCard
          title="Top donors"
          subheader="By total giving this year"
          loading={isLoading}
        >
          {data && (
            <BarChart
              height={300}
              layout="horizontal"
              yAxis={[
                {
                  scaleType: 'band',
                  data: data.topDonors.map((d) => d.name),
                  width: 130,
                },
              ]}
              xAxis={[
                { valueFormatter: (v: number) => formatCompactCurrency(v) },
              ]}
              series={[
                {
                  data: data.topDonors.map((d) => d.total),
                  label: 'Total given',
                  color: chartPalette[0],
                  valueFormatter: (v) => (v == null ? '' : formatCurrency(v)),
                },
              ]}
              margin={{ top: 10, right: 16, bottom: 24, left: 0 }}
            />
          )}
        </ChartCard>

        <Card sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title="Recent donations"
            titleTypographyProps={{ variant: 'h6' }}
          />
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Box>
          ) : (
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Donor</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.recentDonations.map((d) => (
                    <TableRow key={d.id} hover>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <Box
                          component="span"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.donorName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={DONATION_TYPE_LABEL[d.type]}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(d.amount)}
                      </TableCell>
                      <TableCell>{formatDate(d.receivedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Box>
  )
}
