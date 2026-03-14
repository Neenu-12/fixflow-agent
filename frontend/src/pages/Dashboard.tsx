import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Container,
  Grid,
} from "@mui/material";

import {
  TrendingUp as TrendingIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

interface FailureRecord {
  repository: string;
  error: string;
  risk: "Low" | "Medium" | "High";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const summaryCards = [
    {
      title: "Pending Fixes",
      value: 3,
      icon: <PlayIcon sx={{ fontSize: 28 }} />,
      color: "#F59E0B",
    },
    {
      title: "Active PR Fixes",
      value: 2,
      icon: <TrendingIcon sx={{ fontSize: 28 }} />,
      color: "#3B82F6",
    },
    {
      title: "Resolved Today",
      value: 5,
      icon: <CheckIcon sx={{ fontSize: 28 }} />,
      color: "#10B981",
    },
  ];

  const recentFailures: FailureRecord[] = [
    { repository: "api-server", error: "Missing dependency", risk: "Medium" },
    { repository: "worker", error: "Lint error", risk: "Low" },
    { repository: "auth", error: "Syntax error", risk: "High" },
  ];

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={800} color="#111827">
            Dashboard
          </Typography>

          <Typography color="#6B7280">
            Overview of your CI remediation status
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3}>
          {summaryCards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  p: 4,
                  border: "1px solid #E5E7EB",
                  borderRadius: 3,
                  position: "relative",
                  transition: "0.25s",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: card.color,
                  },
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: `0 20px 40px ${card.color}25`,
                    borderColor: card.color,
                  },
                }}
              >
                <Stack spacing={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      background: `${card.color}15`,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Box>
                    <Typography fontSize={14} color="#6B7280">
                      {card.title}
                    </Typography>

                    <Typography fontSize={32} fontWeight={700}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Failures */}
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={700}>
            Recent Failures
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 3,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#F9FAFB" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Repository</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Error</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentFailures.map((failure, index) => (
                  <TableRow
                    key={index}
                    onClick={() => navigate(`/failure/${failure.repository}`)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        background: "#F9FAFB",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {failure.repository}
                    </TableCell>

                    <TableCell>{failure.error}</TableCell>

                    <TableCell>
                      <Chip
                        label={failure.risk}
                        color={getRiskColor(failure.risk)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Dashboard;
