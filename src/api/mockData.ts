import type {
  Campaign,
  CurrentUser,
  DashboardData,
  Donation,
  DonationType,
  Donor,
  Fund,
  NewDonationInput,
  Receipt,
} from './types'
import { DONATION_TYPE_LABEL } from './types'

// Deterministic pseudo-random generator so the demo renders identically each load.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(8351)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function money(min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) / 5) * 5
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Dates are generated relative to "today" so the demo never goes stale.
const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const CURRENT_MONTH_INDEX = NOW.getMonth() // 0-based
const CURRENT_DAY = NOW.getDate()

function daysInMonth(monthIndex: number): number {
  return new Date(CURRENT_YEAR, monthIndex + 1, 0).getDate()
}

function isoDate(monthIndex: number, day: number): string {
  return `${CURRENT_YEAR}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// A random day within a month of the year-to-date window, never in the future.
function randomDayInMonth(monthIndex: number): number {
  const maxDay =
    monthIndex >= CURRENT_MONTH_INDEX ? CURRENT_DAY : daysInMonth(monthIndex)
  return 1 + Math.floor(rand() * maxDay)
}

const FIRST_NAMES = [
  'Amara', 'Liam', 'Sofia', 'Noah', 'Priya', 'Ethan', 'Mei', 'Diego',
  'Fatima', 'Oliver', 'Ingrid', 'Marcus', 'Yuki', 'Hannah', 'Andre', 'Lena',
]
const LAST_NAMES = [
  'Okafor', 'Nguyen', 'Alvarez', 'Bennett', 'Patel', 'Rossi', 'Kim',
  'Johansson', 'Haddad', 'Murphy', 'Schmidt', 'Costa', 'Andersen', 'Silva',
]
const ORG_DONORS = [
  'Brightpath Foundation', 'Cedar & Co.', 'Northwind Trust',
  'Meridian Partners', 'Evergreen Fund', 'Harbor Labs',
]

const CAMPAIGN_DEFS: Array<{ name: string; group: string | null; goal: number; status: Campaign['status'] }> = [
  { name: `${CURRENT_YEAR} Annual Appeal`, group: `${CURRENT_YEAR} Annual Appeal`, goal: 150000, status: 'active' },
  { name: 'Spring Gala', group: `${CURRENT_YEAR} Annual Appeal`, goal: 80000, status: 'active' },
  { name: 'Scholarship Drive', group: `${CURRENT_YEAR} Annual Appeal`, goal: 60000, status: 'active' },
  { name: 'Emergency Relief', group: 'Rapid Response', goal: 100000, status: 'active' },
  { name: 'Capital Campaign', group: null, goal: 500000, status: 'active' },
  { name: `Giving Tuesday ${CURRENT_YEAR - 1}`, group: null, goal: 40000, status: 'closed' },
]

const FUND_DEFS: Array<{ name: string; code: string; restricted: boolean }> = [
  { name: 'General Operating', code: 'GEN', restricted: false },
  { name: 'Scholarship Fund', code: 'SCH', restricted: true },
  { name: 'Building Fund', code: 'BLD', restricted: true },
  { name: 'Emergency Relief', code: 'ERF', restricted: true },
]

const DONATION_TYPES: DonationType[] = [
  'monetary_online',
  'offline_cash_check',
  'in_kind',
]

function buildDonors(): Donor[] {
  const donors: Donor[] = []
  for (let i = 0; i < 48; i++) {
    const isOrg = rand() < 0.2
    const name = isOrg
      ? pick(ORG_DONORS) + ' ' + (i + 1)
      : `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    const lastMonth = Math.floor(rand() * (CURRENT_MONTH_INDEX + 1))
    const lastDay = randomDayInMonth(lastMonth)
    donors.push({
      id: `dn_${i + 1}`,
      type: isOrg ? 'organization' : 'individual',
      name,
      email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.org',
      lifetimeValue: 0,
      lastGiftAt: isoDate(lastMonth, lastDay),
      tags: rand() < 0.3 ? ['major-gift'] : rand() < 0.5 ? ['recurring'] : [],
    })
  }
  return donors
}

function buildCampaigns(): Campaign[] {
  return CAMPAIGN_DEFS.map((c, i) => ({
    id: `cm_${i + 1}`,
    name: c.name,
    groupName: c.group,
    goalAmount: c.goal,
    raisedAmount: 0,
    status: c.status,
    donorCount: 0,
  }))
}

function buildFunds(): Fund[] {
  return FUND_DEFS.map((f, i) => ({
    id: `fd_${i + 1}`,
    name: f.name,
    code: f.code,
    isRestricted: f.restricted,
    raisedAmount: 0,
  }))
}

function buildDonations(
  donors: Donor[],
  campaigns: Campaign[],
  funds: Fund[],
): Donation[] {
  const donations: Donation[] = []
  let idc = 1
  for (let m = 0; m <= CURRENT_MONTH_INDEX; m++) {
    const count = 30 + Math.floor(rand() * 25)
    for (let k = 0; k < count; k++) {
      const donor = pick(donors)
      const type = pick(DONATION_TYPES)
      const campaign = rand() < 0.75 ? pick(campaigns) : null
      const fund = rand() < 0.8 ? pick(funds) : null
      const amount =
        type === 'in_kind'
          ? money(50, 2500)
          : type === 'offline_cash_check'
            ? money(20, 1500)
            : money(10, 5000)
      const day = randomDayInMonth(m)
      donations.push({
        id: `do_${idc++}`,
        donorId: donor.id,
        donorName: donor.name,
        type,
        amount,
        currency: 'USD',
        receivedAt: isoDate(m, day),
        campaignId: campaign?.id ?? null,
        campaignName: campaign?.name ?? null,
        fundId: fund?.id ?? null,
        fundName: fund?.name ?? null,
        status:
          type === 'monetary_online'
            ? 'settled'
            : rand() < 0.95
              ? 'recorded'
              : 'refunded',
      })
    }
  }
  return donations
}

function rollup(
  donors: Donor[],
  campaigns: Campaign[],
  funds: Fund[],
  donations: Donation[],
) {
  const donorTotals = new Map<string, number>()
  const campaignTotals = new Map<string, { total: number; donors: Set<string> }>()
  const fundTotals = new Map<string, number>()

  for (const d of donations) {
    if (d.status === 'refunded' || d.status === 'voided') continue
    donorTotals.set(d.donorId, (donorTotals.get(d.donorId) ?? 0) + d.amount)
    if (d.campaignId) {
      const c = campaignTotals.get(d.campaignId) ?? { total: 0, donors: new Set() }
      c.total += d.amount
      c.donors.add(d.donorId)
      campaignTotals.set(d.campaignId, c)
    }
    if (d.fundId) {
      fundTotals.set(d.fundId, (fundTotals.get(d.fundId) ?? 0) + d.amount)
    }
  }

  for (const donor of donors) {
    donor.lifetimeValue = donorTotals.get(donor.id) ?? 0
  }
  for (const c of campaigns) {
    const agg = campaignTotals.get(c.id)
    c.raisedAmount = agg?.total ?? 0
    c.donorCount = agg?.donors.size ?? 0
  }
  for (const f of funds) {
    f.raisedAmount = fundTotals.get(f.id) ?? 0
  }
}

function buildReceipts(donations: Donation[]): Receipt[] {
  const settled = donations.filter((d) => d.status === 'settled').slice(0, 12)
  return settled.map((d, i) => ({
    id: `rc_${i + 1}`,
    number: `${CURRENT_YEAR}-${String(1001 + i)}`,
    kind: 'per_donation',
    donorName: d.donorName,
    amount: d.amount,
    issuedAt: d.receivedAt,
    emailStatus: i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'failed' : 'sent',
  }))
}

// Build the full dataset once.
const donors = buildDonors()
const campaigns = buildCampaigns()
const funds = buildFunds()
const donations = buildDonations(donors, campaigns, funds)
rollup(donors, campaigns, funds, donations)
const receipts = buildReceipts(donations)

export const db = { donors, campaigns, funds, donations, receipts }

// Tracks the next sequential donation id (seed ids are do_1..do_N).
let donationSeq = donations.length

// Inserts a new donation into the in-memory store and recomputes derived
// rollups so dashboards, campaigns, funds and donors stay consistent.
export function createDonation(input: NewDonationInput): Donation {
  const donor = donors.find((d) => d.id === input.donorId)
  const campaign = input.campaignId
    ? (campaigns.find((c) => c.id === input.campaignId) ?? null)
    : null
  const fund = input.fundId
    ? (funds.find((f) => f.id === input.fundId) ?? null)
    : null

  const donation: Donation = {
    id: `do_${++donationSeq}`,
    donorId: input.donorId,
    donorName: donor?.name ?? 'Unknown donor',
    type: input.type,
    amount: input.amount,
    currency: 'USD',
    receivedAt: input.receivedAt,
    campaignId: campaign?.id ?? null,
    campaignName: campaign?.name ?? null,
    fundId: fund?.id ?? null,
    fundName: fund?.name ?? null,
    status: input.type === 'monetary_online' ? 'settled' : 'recorded',
  }

  donations.push(donation)
  if (donor && donation.receivedAt > donor.lastGiftAt) {
    donor.lastGiftAt = donation.receivedAt
  }
  rollup(donors, campaigns, funds, donations)
  return donation
}

export const currentUser: CurrentUser = {
  id: 'usr_1',
  displayName: 'Jordan Rivera',
  email: 'jordan.rivera@example.org',
  memberships: [
    { tenantId: 'org_1', organizationName: 'Hope Foundation', role: 'Admin' },
    { tenantId: 'org_2', organizationName: 'City Arts Collective', role: 'Staff' },
    { tenantId: 'org_3', organizationName: 'Green Earth Trust', role: 'Viewer' },
  ],
}

export function buildDashboard(): DashboardData {
  const active = donations.filter(
    (d) => d.status !== 'refunded' && d.status !== 'voided',
  )

  // Monthly totals (year to date)
  const monthlyTotals = MONTHS.slice(0, CURRENT_MONTH_INDEX + 1).map((month, i) => {
    const total = active
      .filter((d) => Number(d.receivedAt.slice(5, 7)) - 1 === i)
      .reduce((sum, d) => sum + d.amount, 0)
    return { month, total }
  })

  const ytdTotal = monthlyTotals.reduce((s, m) => s + m.total, 0)

  // Top donors
  const topDonors = [...donors]
    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
    .slice(0, 6)
    .map((d) => ({ name: d.name, total: d.lifetimeValue }))

  // Donation type share
  const donationTypeShares = DONATION_TYPES.map((type) => ({
    type,
    label: DONATION_TYPE_LABEL[type],
    total: active
      .filter((d) => d.type === type)
      .reduce((sum, d) => sum + d.amount, 0),
  }))

  const recentDonations = [...active]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, 8)

  return {
    kpis: {
      ytdTotal,
      donorCount: donors.length,
      avgGift: Math.round(ytdTotal / Math.max(active.length, 1)),
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    },
    monthlyTotals,
    topDonors,
    donationTypeShares,
    recentDonations,
  }
}
