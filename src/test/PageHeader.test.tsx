import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Button from '@mui/material/Button'
import PageHeader from '../components/PageHeader'
import { renderWithTheme } from './renderWithTheme'

describe('PageHeader', () => {
  it('renders the title as a heading', () => {
    renderWithTheme(<PageHeader title="Donors" />)
    expect(
      screen.getByRole('heading', { name: 'Donors' }),
    ).toBeInTheDocument()
  })

  it('renders an optional subtitle', () => {
    renderWithTheme(
      <PageHeader title="Donors" subtitle="Manage your donors" />,
    )
    expect(screen.getByText('Manage your donors')).toBeInTheDocument()
  })

  it('renders an optional action element', () => {
    renderWithTheme(
      <PageHeader title="Donors" action={<Button>Add donor</Button>} />,
    )
    expect(
      screen.getByRole('button', { name: 'Add donor' }),
    ).toBeInTheDocument()
  })

  it('omits the subtitle when not provided', () => {
    renderWithTheme(<PageHeader title="Donors" />)
    expect(screen.queryByText('Manage your donors')).not.toBeInTheDocument()
  })
})
