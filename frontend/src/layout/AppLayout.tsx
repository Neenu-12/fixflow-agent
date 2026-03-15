import { useLocation, Link, Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  MoreTime as PendingIcon,
  CheckCircle as ResolvedIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Bolt as ZapIcon,
} from "@mui/icons-material";

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: "Dashboard", icon: DashboardIcon, route: "/dashboard" },
  { label: "Pending Fixes", icon: PendingIcon, route: "/pending" },
  { label: "Resolved Fixes", icon: ResolvedIcon, route: "/resolved" },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
      }}
    >
      {/* Logo / Branding */}
      <Box sx={{ p: 3, pb: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ZapIcon sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
            FixFlow
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ borderBottom: "1px solid #F3F4F6", mb: 1 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.route;

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={Link}
                to={item.route}
                selected={isActive}
                sx={{
                  borderRadius: "10px",
                  mx: 0.75,
                  px: 2,
                  py: 1.25,
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  backgroundColor: isActive ? "#4F46E5" : "transparent",
                  color: isActive ? "#fff" : "#6B7280",
                  fontWeight: isActive ? 600 : 500,
                  "&:hover": {
                    backgroundColor: isActive
                      ? "#6366F1"
                      : "rgba(79, 70, 229, 0.08)",
                    transform: "translateX(4px)",
                  },
                  ".MuiListItemIcon-root": {
                    color: isActive ? "#fff" : "#6B7280",
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { fontSize: 14, fontWeight: "inherit" },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ borderTop: "1px solid #F3F4F6", mt: 1 }} />

      {/* Footer */}
      <Box sx={{ p: 3, pt: 2.5 }}>
        <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: 12 }}>
          © 2026 FixFlow AI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#FFFFFF",
          border: "none",
          borderBottom: "1px solid #E5E7EB",
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 4,
            minHeight: 64,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: "#111827",
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 18,
                color: "#111827",
                display: { xs: "none", md: "block" },
              }}
            >
              CI Remediation AI
            </Typography>
          </Box>

          {/* Right side icons and user */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              sx={{
                color: "#6B7280",
                transition: "all 0.2s",
                "&:hover": {
                  color: "#4F46E5",
                  background: "rgba(79, 70, 229, 0.08)",
                },
              }}
            >
              <NotificationsIcon />
            </IconButton>

            <Box sx={{ width: 1, height: 32, background: "#E5E7EB" }} />

            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              U
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            width: DRAWER_WIDTH,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {drawerContent}
        </Box>
      </Box>

      {/* Mobile Sidebar */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />

        <Box
          sx={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
