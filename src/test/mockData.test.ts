import { describe, it, expect } from 'vitest'
import {
  buildDashboard,
  createCampaign,
  createDonation,
  createDonor,
  createFund,
  currentUser,
  db,
} from '../api/mockData'

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

  it('dates every donation within the current year and never in the future', () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const today = now.toISOString().slice(0, 10)
    for (const d of db.donations) {
      expect(d.receivedAt.slice(0, 4)).toBe(String(currentYear))
      expect(d.receivedAt <= today).toBe(true)
    }
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
    const now = new Date()
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const expectedLength = now.getMonth() + 1
    expect(data.monthlyTotals).toHaveLength(expectedLength)
    expect(data.monthlyTotals[0].month).toBe('Jan')
    expect(data.monthlyTotals[expectedLength - 1].month).toBe(
      monthNames[now.getMonth()],
    )
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

describe('createDonation', () => {
  const today = new Date().toISOString().slice(0, 10)

  it('appends a donation and updates donor and campaign rollups', () => {
    const donor = db.donors[0]
    const campaign = db.campaigns[0]
    const beforeCount = db.donations.length
    const beforeLifetime = donor.lifetimeValue
    const beforeRaised = campaign.raisedAmount

    const created = createDonation({
      donorId: donor.id,
      type: 'offline_cash_check',
      amount: 250,
      receivedAt: today,
      campaignId: campaign.id,
      fundId: null,
    })

    expect(db.donations).toHaveLength(beforeCount + 1)
    expect(created.donorName).toBe(donor.name)
    expect(created.status).toBe('recorded')
    expect(donor.lifetimeValue).toBe(beforeLifetime + 250)
    expect(campaign.raisedAmount).toBe(beforeRaised + 250)
  })

  it('marks online monetary donations as settled', () => {
    const created = createDonation({
      donorId: db.donors[1].id,
      type: 'monetary_online',
      amount: 100,
      receivedAt: today,
      campaignId: null,
      fundId: null,
    })
    expect(created.status).toBe('settled')
  })

  it('keeps total donor lifetime value equal to active giving', () => {
    createDonation({
      donorId: db.donors[2].id,
      type: 'in_kind',
      amount: 500,
      receivedAt: today,
      campaignId: null,
      fundId: null,
    })
    const totalLifetime = db.donors.reduce((s, d) => s + d.lifetimeValue, 0)
    const activeTotal = db.donations
      .filter((d) => d.status !== 'refunded' && d.status !== 'voided')
      .reduce((s, d) => s + d.amount, 0)
    expect(totalLifetime).toBe(activeTotal)
  })
})

describe('createDonor', () => {
  it('appends a donor with zero lifetime value and no gift history', () => {
    const beforeCount = db.donors.length
    const created = createDonor({
      type: 'individual',
      name: '  Dana Fielding  ',
      email: '  dana@example.org  ',
      tags: ['major-gift'],
    })

    expect(db.donors).toHaveLength(beforeCount + 1)
    expect(created.name).toBe('Dana Fielding')
    expect(created.email).toBe('dana@example.org')
    expect(created.lifetimeValue).toBe(0)
    expect(created.lastGiftAt).toBe('')
    expect(created.tags).toEqual(['major-gift'])
  })

  it('supports organization donors', () => {
    const created = createDonor({
      type: 'organization',
      name: 'Cedar Community Fund',
      email: 'giving@cedarfund.org',
      tags: [],
    })
    expect(created.type).toBe('organization')
    expect(db.donors.some((d) => d.id === created.id)).toBe(true)
  })
})

describe('createCampaign', () => {
  it('appends a campaign with zeroed rollups', () => {
    const beforeCount = db.campaigns.length
    const created = createCampaign({
      name: '  Winter Match  ',
      groupName: 'Rapid Response',
      goalAmount: 25000,
      status: 'active',
    })

    expect(db.campaigns).toHaveLength(beforeCount + 1)
    expect(created.name).toBe('Winter Match')
    expect(created.groupName).toBe('Rapid Response')
    expect(created.goalAmount).toBe(25000)
    expect(created.status).toBe('active')
    expect(created.raisedAmount).toBe(0)
    expect(created.donorCount).toBe(0)
  })

  it('treats a blank group as a standalone campaign', () => {
    const created = createCampaign({
      name: 'Standalone Drive',
      groupName: null,
      goalAmount: 5000,
      status: 'draft',
    })
    expect(created.groupName).toBeNull()
  })
})

describe('createFund', () => {
  it('appends a fund, upper-casing the code and zeroing giving', () => {
    const beforeCount = db.funds.length
    const created = createFund({
      name: '  Youth Programs  ',
      code: ' yth ',
      isRestricted: true,
    })

    expect(db.funds).toHaveLength(beforeCount + 1)
    expect(created.name).toBe('Youth Programs')
    expect(created.code).toBe('YTH')
    expect(created.isRestricted).toBe(true)
    expect(created.raisedAmount).toBe(0)
  })

  it('supports unrestricted funds', () => {
    const created = createFund({
      name: 'General Reserve',
      code: 'RES',
      isRestricted: false,
    })
    expect(created.isRestricted).toBe(false)
    expect(db.funds.some((f) => f.id === created.id)).toBe(true)
  })
})
