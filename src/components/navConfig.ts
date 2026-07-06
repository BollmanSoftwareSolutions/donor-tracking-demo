import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Role } from '../api/types'

export interface NavItem {
  label: string
  path: string
  icon: SvgIconComponent
  minRole: Role
  section: 'main' | 'admin'
}

// Role hierarchy for simple UX gating (the API is the real security boundary).
const ROLE_RANK: Record<Role, number> = { Viewer: 0, Staff: 1, Admin: 2 }

export function roleAllows(userRole: Role, minRole: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Donors', path: '/donors', icon: PeopleAltOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Donations', path: '/donations', icon: VolunteerActivismOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Campaigns', path: '/campaigns', icon: CampaignOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Funds', path: '/funds', icon: SavingsOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Receipts', path: '/receipts', icon: ReceiptLongOutlinedIcon, minRole: 'Staff', section: 'main' },
  { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon, minRole: 'Viewer', section: 'main' },
  { label: 'Import / Export', path: '/data/import-export', icon: ImportExportOutlinedIcon, minRole: 'Staff', section: 'main' },
  { label: 'Audit Log', path: '/admin/audit', icon: HistoryOutlinedIcon, minRole: 'Admin', section: 'admin' },
  { label: 'Org Settings', path: '/admin/settings', icon: SettingsOutlinedIcon, minRole: 'Admin', section: 'admin' },
  { label: 'Users', path: '/admin/users', icon: ManageAccountsOutlinedIcon, minRole: 'Admin', section: 'admin' },
]
