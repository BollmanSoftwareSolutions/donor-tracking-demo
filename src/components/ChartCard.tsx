import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subheader?: string
  loading?: boolean
  height?: number
  action?: ReactNode
  children: ReactNode
}

export default function ChartCard({
  title,
  subheader,
  loading,
  height = 300,
  action,
  children,
}: ChartCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={action}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {loading ? (
          <Skeleton variant="rounded" width="100%" height={height} />
        ) : (
          <Box sx={{ height }}>{children}</Box>
        )}
      </CardContent>
    </Card>
  )
}
