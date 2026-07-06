import { describe, it, expect } from 'vitest'
import { buildDashboard, currentUser, db } from '../api/mockData'

const activeAmount = () =>
  db.donations
    .filter((d) => d.status !== 'refunded' && d.status !== 'voided')
    .reduce((sum, d) => sum + d.amount, 0)

describe('seed data (db)', () => {
  it('seeds the expected collection sizes', () => {
    expect(db.donors).toHaveLength(48)
    expect(db.campaigns).toHaveLength(6)
    expect(db.funds).toHaveLength(4)
    expect(db.donations.length).toBeGreaterThan(0)
  })

  it('references only existing donors from donations', () => {
    const donorIds = new Set(db.donors.map((d) => d.id))
    expect(db.donations.every((d) => donorIds.has(d.donorId))).toBe(true)
  })

  it('rolls up donor lifetime value from active donations', () => {
    const totalLifetime = db.donors.reduce((s, d) => s + d.lifetimeValue, 0)
    expect(totalLifetime).toBe(activeAmount())
  })

  it('never rolls up more into campaigns than total active giving', () => {
    const campaignTotal = db.campaigns.reduce((s, c) => s + c.raisedAmount, 0)
    expect(campaignTotal).toBeLessThanOrEqual(activeAmount())
    expect(db.campaigns.every((c) => c.raisedAmount >= 0)).toBe(true)
  })
})

describe('currentUser', () => {
  it('belongs to multiple organizations with scoped roles', () => {
    expect(currentUser.memberships.length).toBeGreaterThan(1)
    const roles = currentUser.memberships.map((m) => m.role)
    expect(roles).toContain('Admin')
  })
})

describe('buildDashboard', () => {
  const data = buildDashboard()

  it('reports a YTD total equal to the sum of monthly totals', () => {
    const sumOfMonths = data.monthlyTotals.reduce((s, m) => s + m.total, 0)
    expect(data.kpis.ytdTotal).toBe(sumOfMonths)
  })

  it('covers January through the current month', () => {
    expect(data.monthlyTotals).toHaveLength(7)
    expect(data.monthlyTotals[0].month).toBe('Jan')
    expect(data.monthlyTotals[6].month).toBe('Jul')
  })

  it('donation type shares sum to the YTD total', () => {
    const sumOfShares = data.donationTypeShares.reduce(
      (s, share) => s + share.total,
      0,
    )
    expect(sumOfShares).toBe(data.kpis.ytdTotal)
    expect(data.donationTypeShares).toHaveLength(3)
  })

  it('returns top donors sorted by descending total', () => {
    expect(data.topDonors).toHaveLength(6)
    for (let i = 1; i < data.topDonors.length; i++) {
      expect(data.topDonors[i - 1].total).toBeGreaterThanOrEqual(
        data.topDonors[i].total,
      )
    }
  })

  it('returns recent donations sorted by descending date, capped at 8', () => {
    expect(data.recentDonations.length).toBeLessThanOrEqual(8)
    for (let i = 1; i < data.recentDonations.length; i++) {
      expect(
        data.recentDonations[i - 1].receivedAt >=
          data.recentDonations[i].receivedAt,
      ).toBe(true)
    }
  })

  it('counts the donor total and active campaigns', () => {
    expect(data.kpis.donorCount).toBe(db.donors.length)
    expect(data.kpis.activeCampaigns).toBe(
      db.campaigns.filter((c) => c.status === 'active').length,
    )
  })
})
