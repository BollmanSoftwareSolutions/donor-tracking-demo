import { describe, it, expect } from 'vitest'
import { NAV_ITEMS, roleAllows } from '../components/navConfig'
import type { Role } from '../api/types'

describe('roleAllows', () => {
  it('grants access when the user role meets the minimum', () => {
    expect(roleAllows('Admin', 'Staff')).toBe(true)
    expect(roleAllows('Staff', 'Staff')).toBe(true)
    expect(roleAllows('Staff', 'Viewer')).toBe(true)
  })

  it('denies access when the user role is below the minimum', () => {
    expect(roleAllows('Viewer', 'Staff')).toBe(false)
    expect(roleAllows('Staff', 'Admin')).toBe(false)
    expect(roleAllows('Viewer', 'Admin')).toBe(false)
  })

  it('always allows a role to access its own level', () => {
    const roles: Role[] = ['Viewer', 'Staff', 'Admin']
    for (const role of roles) {
      expect(roleAllows(role, role)).toBe(true)
    }
  })
})

describe('NAV_ITEMS role filtering', () => {
  const visibleFor = (role: Role) =>
    NAV_ITEMS.filter((item) => roleAllows(role, item.minRole))

  it('shows every nav item to an Admin', () => {
    expect(visibleFor('Admin')).toHaveLength(NAV_ITEMS.length)
  })

  it('hides all admin-section items from non-admins', () => {
    const staffAdminItems = visibleFor('Staff').filter(
      (i) => i.section === 'admin',
    )
    expect(staffAdminItems).toHaveLength(0)
  })

  it('shows only Viewer-level items to a Viewer', () => {
    const viewerItems = visibleFor('Viewer')
    expect(viewerItems.every((i) => i.minRole === 'Viewer')).toBe(true)
    expect(viewerItems.length).toBeGreaterThan(0)
    // A Viewer should not see the Staff-only Receipts screen.
    expect(viewerItems.some((i) => i.path === '/receipts')).toBe(false)
  })

  it('always includes the dashboard for every role', () => {
    for (const role of ['Viewer', 'Staff', 'Admin'] as Role[]) {
      expect(visibleFor(role).some((i) => i.path === '/dashboard')).toBe(true)
    }
  })
})
