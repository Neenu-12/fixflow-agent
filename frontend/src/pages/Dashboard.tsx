import React from "react";
import { useQuery } from "@tanstack/react-query";
import { buildFailuresUrl } from "../config/api";
import LoadingState from "../components/LoadingState";

import {
  Alert,
  Box,
  Card,
  Stack,
  Typography,
  Container,
  Grid,
} from "@mui/material";

import {
  TrendingUp as TrendingIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Cancel as DeniedIcon,
} from "@mui/icons-material";

interface ApiFailure {
  failure_id?: string;
  repo_name?: string;
}

interface DashboardData {
  pendingCount: number;
  approvedCount: number;
  resolvedCount: number;
  deniedCount: number;
}

const normalizeApiPayload = (payload: unknown): ApiFailure[] => {
  if (Array.isArray(payload)) {
    return payload as ApiFailure[];
  }

  if (payload && typeof payload === "object") {
    const payloadObject = payload as Record<string, unknown>;

    if (Array.isArray(payloadObject.data)) {
      return payloadObject.data as ApiFailure[];
    }

    if (typeof payloadObject.body === "string") {
      const parsedBody = JSON.parse(payloadObject.body) as unknown;

      if (Array.isArray(parsedBody)) {
        return parsedBody as ApiFailure[];
      }

      if (
        parsedBody &&
        typeof parsedBody === "object" &&
        Array.isArray((parsedBody as Record<string, unknown>).data)
      ) {
        return (parsedBody as Record<string, unknown>).data as ApiFailure[];
      }
    }
  }

  return [];
};

const fetchByStatus = async (status: string): Promise<ApiFailure[]> => {
  const response = await fetch(buildFailuresUrl({ status }), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${status} failures (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  return normalizeApiPayload(payload);
};

const fetchDashboardData = async (): Promise<DashboardData> => {
  const [pendingFailures, approvedFailures, deniedFailures] = await Promise.all([
    fetchByStatus("pending_approval"),
    fetchByStatus("approved"),
    fetchByStatus("action_denied"),
  ]);

  return {
    pendingCount: pendingFailures.length,
    approvedCount: approvedFailures.length,
    resolvedCount: approvedFailures.length,
    deniedCount: deniedFailures.length,
  };
};

const Dashboard: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardData,
    refetchInterval: 1800000,
    staleTime: 60000,
  });

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const summaryCards = [
    {
      title: "Pending Fixes",
      value: data?.pendingCount || 0,
      icon: <PlayIcon sx={{ fontSize: 28 }} />,
      color: "#F59E0B",
    },
    {
      title: "Approved Fixes",
      value: data?.approvedCount || 0,
      icon: <TrendingIcon sx={{ fontSize: 28 }} />,
      color: "#3B82F6",
    },
    {
      title: "Resolved Count",
      value: data?.resolvedCount || 0,
      icon: <CheckIcon sx={{ fontSize: 28 }} />,
      color: "#10B981",
    },
    {
      title: "Denied Actions",
      value: data?.deniedCount || 0,
      icon: <DeniedIcon sx={{ fontSize: 28 }} />,
      color: "#EF4444",
    },
  ];

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

        {isError ? (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : "Unable to load dashboard counts."}
          </Alert>
        ) : null}

        {/* Summary Cards */}
        <Grid container spacing={3}>
          {summaryCards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
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
      </Stack>
    </Container>
  );
};

export default Dashboard;
