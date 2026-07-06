import { useState, type MouseEvent } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuIcon from '@mui/icons-material/Menu'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import CheckIcon from '@mui/icons-material/Check'
import type { ReactNode } from 'react'
import { NAV_ITEMS, roleAllows } from './navConfig'
import { useTenant } from '../hooks/useTenant'

const DRAWER_WIDTH = 264

export default function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { memberships, activeMembership, setActiveTenantId, user } = useTenant()
  const role = activeMembership.role

  const [orgAnchor, setOrgAnchor] = useState<null | HTMLElement>(null)
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null)

  const visibleItems = NAV_ITEMS.filter((item) => roleAllows(role, item.minRole))
  const mainItems = visibleItems.filter((i) => i.section === 'main')
  const adminItems = visibleItems.filter((i) => i.section === 'admin')

  const handleNavClick = () => {
    if (!isDesktop) setMobileOpen(false)
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2, gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <FavoriteIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            GiveTrack
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Donor Management
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {mainItems.map((item) => {
            const selected =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/')
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={selected}
                  onClick={handleNavClick}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <item.icon
                      fontSize="small"
                      color={selected ? 'primary' : 'inherit'}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
        {adminItems.length > 0 && (
          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px' }}>
                Administration
              </ListSubheader>
            }
          >
            {adminItems.map((item) => {
              const selected = location.pathname.startsWith(item.path)
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    selected={selected}
                    onClick={handleNavClick}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <item.icon
                        fontSize="small"
                        color={selected ? 'primary' : 'inherit'}
                      />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Demo data · resets on reload
        </Typography>
      </Box>
    </Box>
  )

  const openOrgMenu = (e: MouseEvent<HTMLElement>) => setOrgAnchor(e.currentTarget)
  const openUserMenu = (e: MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>

          {/* Organization / tenant switcher */}
          <Button
            onClick={openOrgMenu}
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            sx={{
              textTransform: 'none',
              maxWidth: { xs: 160, sm: 'none' },
            }}
          >
            <Box sx={{ textAlign: 'left', overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.2 }}>
                {activeMembership.organizationName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Active organization
              </Typography>
            </Box>
          </Button>
          <Menu
            anchorEl={orgAnchor}
            open={Boolean(orgAnchor)}
            onClose={() => setOrgAnchor(null)}
          >
            {memberships.map((m) => (
              <MenuItem
                key={m.tenantId}
                selected={m.tenantId === activeMembership.tenantId}
                onClick={() => {
                  setActiveTenantId(m.tenantId)
                  setOrgAnchor(null)
                }}
              >
                <ListItemIcon>
                  {m.tenantId === activeMembership.tenantId ? (
                    <CheckIcon fontSize="small" />
                  ) : null}
                </ListItemIcon>
                <ListItemText primary={m.organizationName} secondary={m.role} />
              </MenuItem>
            ))}
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label={role}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600 }}
          />

          <Tooltip title="Account">
            <IconButton onClick={openUserMenu} sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
                {user.displayName.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: 240 } } }}
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.displayName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.displayName}
                secondary={user.email}
              />
            </ListItem>
            <Divider />
            <MenuItem onClick={() => setUserAnchor(null)}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => setUserAnchor(null)}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation drawers: permanent on desktop, temporary on mobile */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  )
}
