import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import KpiCard from '../components/KpiCard'
import { renderWithTheme } from './renderWithTheme'

describe('KpiCard', () => {
  it('renders the label and value', () => {
    renderWithTheme(
      <KpiCard label="YTD donations" value="$511,365" icon={AttachMoneyIcon} />,
    )
    expect(screen.getByText('YTD donations')).toBeInTheDocument()
    expect(screen.getByText('$511,365')).toBeInTheDocument()
  })

  it('shows a skeleton and hides the value while loading', () => {
    const { container } = renderWithTheme(
      <KpiCard
        label="YTD donations"
        value="$511,365"
        icon={AttachMoneyIcon}
        loading
      />,
    )
    expect(screen.queryByText('$511,365')).not.toBeInTheDocument()
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })
})
