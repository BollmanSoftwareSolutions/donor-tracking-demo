import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Footer from '../components/Footer'
import { renderWithTheme } from './renderWithTheme'

describe('Footer', () => {
  it('shows the copyright with the current year', () => {
    renderWithTheme(<Footer />)
    const year = new Date().getFullYear()
    expect(
      screen.getByText(
        new RegExp(`©\\s*${year}\\s*Bollman Software Solutions, LLC`),
      ),
    ).toBeInTheDocument()
  })

  it('links to the company site with the expected label', () => {
    renderWithTheme(<Footer />)
    const link = screen.getByRole('link', {
      name: 'Bollman Software Solutions',
    })
    expect(link).toHaveAttribute('href', 'https://bollmansoftware.com')
  })
})
