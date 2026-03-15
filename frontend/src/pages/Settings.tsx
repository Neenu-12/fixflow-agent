import React from "react";
import { Box, Stack } from "@mui/material";
import {
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Button,
} from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";

const Settings: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={6}>
        {/* Page Header */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#111827",
              mb: 1,
            }}
          >
            Settings
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Manage your account and preferences
          </Typography>
        </Box>

        {/* Account Section */}
        <Paper
          sx={{
            p: 4,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
          }}
        >
          <Stack spacing={3}>
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
            >
              Account
            </Typography>

            <Divider />

            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background:
                    "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                }}
              >
                U
              </Avatar>
              <Stack>
                <Typography
                  sx={{ fontWeight: 600, color: "#111827", fontSize: 15 }}
                >
                  user@example.com
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                  Google Account
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Preferences Section */}
        <Paper
          sx={{
            p: 4,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
          }}
        >
          <Stack spacing={3}>
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
            >
              Preferences
            </Typography>

            <Divider />

            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#111827" }}>
                      Enable CI Auto Fix Suggestions
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      Automatically suggest fixes for CI failures
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#111827" }}>
                      Enable Email Notifications
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      Receive updates about CI status changes
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#111827" }}>
                      Auto-approve Low Risk Fixes
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      Automatically approve fixes with {">"} 95% confidence
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Danger Zone */}
        <Paper
          sx={{
            p: 4,
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "12px",
          }}
        >
          <Stack spacing={3}>
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, color: "#DC2626" }}
            >
              Danger Zone
            </Typography>

            <Divider />

            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              sx={{
                borderColor: "#EF4444",
                color: "#EF4444",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 15,
                justifyContent: "flex-start",
                py: 1.75,
                borderRadius: "8px",
                border: "2px solid",
                transition: "all 0.3s",
                "&:hover": {
                  background: "#FEE2E2",
                  borderColor: "#DC2626",
                },
              }}
            >
              Sign Out
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Settings;
