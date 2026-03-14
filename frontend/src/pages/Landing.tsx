import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Card,
  Container,
  Toolbar,
  Typography,
  Stack,
  Grid,
} from "@mui/material";

import {
  GitHub,
  AutoFixHigh,
  CheckCircle,
  BugReport,
  IntegrationInstructions,
  ArrowRight,
  FlashOn,
} from "@mui/icons-material";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BugReport sx={{ fontSize: 34, color: "#4F46E5" }} />,
      title: "AI Root Cause Detection",
      description:
        "Automatically analyze CI failures and identify root causes using AI.",
    },
    {
      icon: <AutoFixHigh sx={{ fontSize: 34, color: "#4F46E5" }} />,
      title: "Smart Fix Suggestions",
      description: "AI generates contextual fixes tailored to your CI failure.",
    },
    {
      icon: <CheckCircle sx={{ fontSize: 34, color: "#4F46E5" }} />,
      title: "Automated Pull Requests",
      description: "Create pull requests automatically after reviewing fixes.",
    },
    {
      icon: <IntegrationInstructions sx={{ fontSize: 34, color: "#4F46E5" }} />,
      title: "GitHub Integration",
      description: "Seamless GitHub integration for real-time CI monitoring.",
    },
  ];

  const steps = [
    {
      title: "CI Failure Detected",
      description: "Your pipeline fails and FixFlow captures the logs.",
    },
    {
      title: "AI Analysis",
      description: "Our AI analyzes the failure and detects the root cause.",
    },
    {
      title: "Fix Generated",
      description: "FixFlow generates a patch with confidence score.",
    },
    {
      title: "Pull Request Created",
      description: "Approve the fix and FixFlow opens a PR automatically.",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Toolbar sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FlashOn sx={{ color: "#4F46E5" }} />
            <Typography fontWeight={700} fontSize={20}>
              FixFlow
            </Typography>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Sign In
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                background: "#4F46E5",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { background: "#6366F1" },
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#F8FAFC,#EEF2FF)",
          py: { xs: 10, md: 16 },
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* LEFT */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={4}>
                <Typography
                  sx={{
                    fontSize: { xs: 40, md: 60 },
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  Fix CI Failures
                  <br />
                  Automatically with AI
                </Typography>

                <Typography
                  sx={{
                    color: "#6B7280",
                    fontSize: 18,
                    maxWidth: 520,
                  }}
                >
                  FixFlow analyzes CI failures, suggests fixes, and generates
                  pull requests automatically so your team can ship faster.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<GitHub />}
                    onClick={() => navigate("/login")}
                    sx={{
                      background: "#4F46E5",
                      textTransform: "none",
                      px: 4,
                      py: 1.6,
                      fontWeight: 600,
                      "&:hover": { background: "#6366F1" },
                    }}
                  >
                    Continue with GitHub
                  </Button>

                  <Button
                    variant="outlined"
                    endIcon={<ArrowRight />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.6,
                    }}
                  >
                    View Demo
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            {/* RIGHT HERO CARD */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                }}
              >
                <Stack spacing={3}>
                  <Typography fontWeight={700}>Example CI Failure</Typography>

                  <Box
                    sx={{
                      background: "#F9FAFB",
                      p: 2,
                      borderRadius: 2,
                      fontFamily: "monospace",
                    }}
                  >
                    Missing dependency: pandas
                  </Box>

                  <Box
                    sx={{
                      background: "#ECFDF5",
                      p: 2,
                      borderRadius: 2,
                      color: "#065F46",
                      fontWeight: 600,
                    }}
                  >
                    Suggested Fix → add pandas==2.2.1
                  </Box>

                  <Typography fontSize={14} color="#6B7280">
                    Confidence: 91%
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="xl" sx={{ py: 12 }}>
        <Stack spacing={8}>
          <Stack spacing={2} alignItems="center">
            <Typography fontSize={40} fontWeight={800}>
              Powerful Features
            </Typography>

            <Typography color="#6B7280">
              Everything you need to fix CI failures automatically.
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid size={{ xs: 12, md: 3 }} key={i}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid #E5E7EB",
                    transition: "0.25s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Stack spacing={3}>
                    {f.icon}

                    <Typography fontWeight={700}>{f.title}</Typography>

                    <Typography fontSize={14} color="#6B7280">
                      {f.description}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* HOW IT WORKS */}
      <Box sx={{ background: "#F9FAFB", py: 12 }}>
        <Container maxWidth="xl">
          <Stack spacing={8}>
            <Stack spacing={2} alignItems="center">
              <Typography fontSize={40} fontWeight={800}>
                How It Works
              </Typography>

              <Typography color="#6B7280">
                From failure to pull request in minutes.
              </Typography>
            </Stack>

            <Grid container spacing={4}>
              {steps.map((s, i) => (
                <Grid size={{ xs: 12, md: 3 }} key={i}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        background: "#4F46E5",
                        color: "#fff",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </Box>

                    <Typography fontWeight={700}>{s.title}</Typography>

                    <Typography fontSize={14} color="#6B7280">
                      {s.description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#4F46E5,#6366F1)",
          py: 12,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Typography fontSize={40} fontWeight={800} color="#fff">
              Start Fixing CI Failures Today
            </Typography>

            <Typography color="rgba(255,255,255,0.9)">
              Join engineering teams saving hours of debugging every week.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<GitHub />}
                onClick={() => navigate("/login")}
                sx={{
                  background: "#fff",
                  color: "#4F46E5",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 4,
                }}
              >
                Get Started
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderColor: "#fff",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                View Docs
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ background: "#111827", py: 6 }}>
        <Container maxWidth="xl">
          <Typography color="#9CA3AF" align="center">
            © 2026 FixFlow AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
