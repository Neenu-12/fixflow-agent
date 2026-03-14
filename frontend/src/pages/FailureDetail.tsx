import React, { useState } from "react";
import DiffViewer from "../components/DiffViewer";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Grid,
} from "@mui/material";

import {
  CheckCircle,
  Cancel as RejectIcon,
  BugReport as BugIcon,
} from "@mui/icons-material";

const FailureDetail: React.FC = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleApproveFix = () => {
    setOpenSnackbar(true);
  };

  const handleRejectFix = () => {
    console.log("Fix rejected");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BugIcon sx={{ fontSize: 28, color: "#DC2626" }} />

            <Typography variant="h4" fontWeight={800} color="#111827">
              Failure Detail
            </Typography>
          </Stack>

          <Typography color="#6B7280" fontSize={16} mt={1}>
            Review the CI failure and suggested fix
          </Typography>
        </Box>

        {/* Info Grid */}
        <Grid container spacing={3}>
          {/* Repository Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#4F46E5",
                  boxShadow: "0 8px 16px rgba(79,70,229,0.12)",
                },
              }}
            >
              <Typography fontWeight={700} mb={3}>
                Repository Info
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    fontSize={12}
                    color="#9CA3AF"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Repository
                  </Typography>

                  <Typography fontWeight={600} fontSize={16}>
                    api-server
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    fontSize={12}
                    color="#9CA3AF"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Branch
                  </Typography>

                  <Typography fontWeight={600}>main</Typography>
                </Box>

                <Box>
                  <Typography
                    fontSize={12}
                    color="#9CA3AF"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Commit
                  </Typography>

                  <Typography
                    fontFamily="monospace"
                    fontWeight={600}
                    fontSize={14}
                    sx={{
                      background: "#F0E7FE",
                      px: 2,
                      py: 0.75,
                      borderRadius: 1,
                      display: "inline-block",
                      color: "#4F46E5",
                    }}
                  >
                    abc123def456
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* CI Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#DC2626",
                  boxShadow: "0 8px 16px rgba(220,38,38,0.12)",
                },
              }}
            >
              <Typography fontWeight={700} mb={3}>
                CI Failure Status
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    fontSize={12}
                    color="#9CA3AF"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Root Cause
                  </Typography>

                  <Typography fontSize={15}>
                    Module{" "}
                    <Typography
                      component="span"
                      fontFamily="monospace"
                      sx={{
                        background: "#F3F4F6",
                        px: 1,
                        borderRadius: 1,
                      }}
                    >
                      pandas
                    </Typography>{" "}
                    imported but not listed in requirements.txt
                  </Typography>
                </Box>

                {/* Confidence + Risk */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      fontSize={12}
                      color="#9CA3AF"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      Confidence
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700} fontSize={24}>
                        91%
                      </Typography>

                      <Chip
                        label="Very High"
                        size="small"
                        sx={{
                          background: "#DBEAFE",
                          color: "#0369A1",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      fontSize={12}
                      color="#9CA3AF"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      Risk Level
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700}>Medium</Typography>

                      <Chip
                        label="Moderate"
                        size="small"
                        sx={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Suggested Fix */}
        <Paper
          sx={{
            p: 4,
            border: "2px solid #10B981",
            borderRadius: 3,
            "&:hover": {
              boxShadow: "0 12px 24px rgba(16,185,129,0.15)",
            },
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CheckCircle sx={{ color: "#10B981" }} />

              <Box>
                <Typography fontWeight={700}>Suggested Fix</Typography>

                <Typography fontSize={13} color="#6B7280">
                  AI-generated patch with 91% confidence
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 3,
                overflow: "auto",
              }}
            >
              <DiffViewer
                fileName="requirements.txt"
                diffText={`diff --git a/requirements.txt b/requirements.txt
@@
 numpy
 flask
+ pandas==2.2.1`}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Actions */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleApproveFix}
            sx={{
              background: "#10B981",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                background: "#059669",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(16,185,129,0.25)",
              },
            }}
          >
            Approve Fix
          </Button>

          <Button
            variant="outlined"
            startIcon={<RejectIcon />}
            onClick={handleRejectFix}
            sx={{
              borderColor: "#EF4444",
              color: "#EF4444",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                background: "#FEE2E2",
                borderColor: "#DC2626",
                color: "#DC2626",
              },
            }}
          >
            Reject
          </Button>
        </Stack>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" variant="filled">
            Pull Request created successfully!
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
};

export default FailureDetail;
