import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import PlaceholderPage from './components/PlaceholderPage'
import Dashboard from './routes/Dashboard'
import Donors from './routes/Donors'
import Donations from './routes/Donations'
import Campaigns from './routes/Campaigns'
import Funds from './routes/Funds'
import Receipts from './routes/Receipts'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/funds" element={<Funds />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Reports"
              subtitle="Campaign/fund performance, retention and lapsed analysis"
            />
          }
        />
        <Route
          path="/data/import-export"
          element={
            <PlaceholderPage
              title="Import / Export"
              subtitle="Bulk CSV import wizard and filtered exports"
            />
          }
        />
        <Route
          path="/admin/audit"
          element={
            <PlaceholderPage
              title="Audit Log"
              subtitle="Searchable, append-only compliance trail"
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PlaceholderPage
              title="Org Settings"
              subtitle="Receipt templates, branding and fund configuration"
            />
          }
        />
        <Route
          path="/admin/users"
          element={
            <PlaceholderPage
              title="Users"
              subtitle="Invite members, assign roles and manage access"
            />
          }
        />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page not found"
              subtitle="The page you requested does not exist"
            />
          }
        />
      </Routes>
    </AppShell>
  )
}
