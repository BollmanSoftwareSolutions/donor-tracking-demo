import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import PageHeader from './PageHeader'

interface PlaceholderPageProps {
  title: string
  subtitle?: string
  description?: string
}

export default function PlaceholderPage({
  title,
  subtitle,
  description,
}: PlaceholderPageProps) {
  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} />
      <Card
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.5,
        }}
      >
        <ConstructionOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
        <Typography variant="h6">Coming soon</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          {description ??
            'This screen is part of the design specification and will be implemented in a later iteration.'}
        </Typography>
      </Card>
    </Box>
  )
}
