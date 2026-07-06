import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

export default function Footer() {
  const theme = useTheme()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        px: { xs: 2, sm: 3 },
        py: 2,
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {year} Bollman Software Solutions, LLC ·{' '}
        <Link
          href="https://bollmansoftware.com"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
        >
          Bollman Software Solutions
        </Link>
      </Typography>
    </Box>
  )
}
