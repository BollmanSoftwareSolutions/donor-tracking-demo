// Shared domain DTOs — used by both mock and (future) http transports.
// Mirrors design-docs/02-data-model.md at the shape needed by the UI.

export type Role = 'Admin' | 'Staff' | 'Viewer'

export type DonationType =
  | 'monetary_online'
  | 'offline_cash_check'
  | 'in_kind'

export type DonationStatus = 'recorded' | 'settled' | 'refunded' | 'voided'

export type CampaignStatus = 'draft' | 'active' | 'closed'

export interface Organization {
  id: string
  name: string
}

export interface Membership {
  tenantId: string
  organizationName: string
  role: Role
}

export interface CurrentUser {
  id: string
  displayName: string
  email: string
  memberships: Membership[]
}

export interface Donor {
  id: string
  type: 'individual' | 'organization'
  name: string
  email: string
  lifetimeValue: number
  lastGiftAt: string
  tags: string[]
}

export interface Donation {
  id: string
  donorId: string
  donorName: string
  type: DonationType
  amount: number
  currency: string
  receivedAt: string
  campaignId: string | null
  campaignName: string | null
  fundId: string | null
  fundName: string | null
  status: DonationStatus
}

export interface Campaign {
  id: string
  name: string
  groupName: string | null
  goalAmount: number
  raisedAmount: number
  status: CampaignStatus
  donorCount: number
}

export interface Fund {
  id: string
  name: string
  code: string
  isRestricted: boolean
  raisedAmount: number
}

export interface Receipt {
  id: string
  number: string
  kind: 'per_donation' | 'annual_statement'
  donorName: string
  amount: number
  issuedAt: string
  emailStatus: 'pending' | 'sent' | 'failed'
}

// Dashboard aggregates
export interface MonthlyTotal {
  month: string // e.g. "Jan"
  total: number
}

export interface TopDonor {
  name: string
  total: number
}

export interface DonationTypeShare {
  type: DonationType
  label: string
  total: number
}

export interface DashboardData {
  kpis: {
    ytdTotal: number
    donorCount: number
    avgGift: number
    activeCampaigns: number
  }
  monthlyTotals: MonthlyTotal[]
  topDonors: TopDonor[]
  donationTypeShares: DonationTypeShare[]
  recentDonations: Donation[]
}

// Payload for creating a donation (shared by mock and future http transports).
export interface NewDonationInput {
  donorId: string
  type: DonationType
  amount: number
  receivedAt: string
  campaignId: string | null
  fundId: string | null
  note?: string
}

// Payload for creating a donor.
export interface NewDonorInput {
  type: 'individual' | 'organization'
  name: string
  email: string
  tags: string[]
}

// Payload for creating a campaign.
export interface NewCampaignInput {
  name: string
  groupName: string | null
  goalAmount: number
  status: CampaignStatus
}

export const DONATION_TYPE_LABEL: Record<DonationType, string> = {
  monetary_online: 'Online monetary',
  offline_cash_check: 'Offline cash/check',
  in_kind: 'In-kind',
}
