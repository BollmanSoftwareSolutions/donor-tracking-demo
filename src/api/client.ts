import { buildDashboard, createCampaign, createDonation, createDonor, createFund, currentUser, db } from './mockData'
import type {
  Campaign,
  CurrentUser,
  DashboardData,
  Donation,
  Donor,
  Fund,
  NewCampaignInput,
  NewDonationInput,
  NewDonorInput,
  NewFundInput,
  Receipt,
} from './types'

// Small artificial latency so loading states are visible (see mock strategy doc).
function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Public typed client. In production this would switch transports via VITE_API_MODE;
// for the demo everything resolves against the in-browser mock store.
export const apiClient = {
  getCurrentUser(): Promise<CurrentUser> {
    return delay(currentUser)
  },
  getDashboard(): Promise<DashboardData> {
    return delay(buildDashboard())
  },
  getDonors(): Promise<Donor[]> {
    return delay(db.donors)
  },
  createDonor(input: NewDonorInput): Promise<Donor> {
    return delay(createDonor(input))
  },
  getDonations(): Promise<Donation[]> {
    return delay(
      [...db.donations].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    )
  },
  createDonation(input: NewDonationInput): Promise<Donation> {
    return delay(createDonation(input))
  },
  getCampaigns(): Promise<Campaign[]> {
    return delay(db.campaigns)
  },
  createCampaign(input: NewCampaignInput): Promise<Campaign> {
    return delay(createCampaign(input))
  },
  getFunds(): Promise<Fund[]> {
    return delay(db.funds)
  },
  createFund(input: NewFundInput): Promise<Fund> {
    return delay(createFund(input))
  },
  getReceipts(): Promise<Receipt[]> {
    return delay(db.receipts)
  },
}
