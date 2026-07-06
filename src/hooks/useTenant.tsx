import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { currentUser } from '../api/mockData'
import type { Membership } from '../api/types'

interface TenantContextValue {
  memberships: Membership[]
  activeTenantId: string
  activeMembership: Membership
  setActiveTenantId: (tenantId: string) => void
  user: { displayName: string; email: string }
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const memberships = currentUser.memberships
  const [activeTenantId, setActiveTenantId] = useState(memberships[0].tenantId)

  const value = useMemo<TenantContextValue>(() => {
    const activeMembership =
      memberships.find((m) => m.tenantId === activeTenantId) ?? memberships[0]
    return {
      memberships,
      activeTenantId,
      activeMembership,
      setActiveTenantId,
      user: {
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    }
  }, [activeTenantId, memberships])

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider')
  return ctx
}
