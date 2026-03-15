import React from "react";
import { useQuery } from "@tanstack/react-query";
import StatusChip from "../components/StatusChip";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { buildFailuresUrl } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Box,
} from "@mui/material";

interface PendingFix {
  failureId: string;
  repository: string;
  branch: string;
  error: string;
  risk: "Low" | "Medium" | "High";
}

interface ApiFailure {
  failure_id?: string;
  repo_name?: string;
  branch?: string;
  root_cause?: string;
  risk_score?: string;
}

const toRiskLabel = (riskScore?: string): PendingFix["risk"] => {
  const normalizedRisk = (riskScore || "").toLowerCase();

  if (normalizedRisk === "high") {
    return "High";
  }

  if (normalizedRisk === "medium") {
    return "Medium";
  }

  return "Low";
};

const toStatus = (risk: PendingFix["risk"]): "error" | "warning" | "success" => {
  if (risk === "High") {
    return "error";
  }

  if (risk === "Medium") {
    return "warning";
  }

  return "success";
};

const normalizeApiPayload = (payload: unknown): ApiFailure[] => {
  if (Array.isArray(payload)) {
    return payload;
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

const fetchPendingFixes = async (): Promise<PendingFix[]> => {
  const response = await fetch(buildFailuresUrl({ status: "pending_approval" }), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pending fixes (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  const failures = normalizeApiPayload(payload);

  return failures.map((failure, index) => ({
    failureId: failure.failure_id || `${failure.repo_name || "repo"}-${index}`,
    repository: failure.repo_name || "Unknown repository",
    branch: failure.branch || "Unknown",
    error: failure.root_cause || "No error summary available",
    risk: toRiskLabel(failure.risk_score),
  }));
};

const PendingFixes: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: pendingFixesData = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pending-failures"],
    queryFn: fetchPendingFixes,
    refetchInterval: 1800000,
    staleTime: 10000,
  });

  if (isLoading) {
    return <LoadingState message="Loading pending fixes..." />;
  }

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
            Pending Fixes
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Fixes waiting for approval
          </Typography>
        </Box>

        {isError ? (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : "Unable to fetch pending fixes."}
          </Alert>
        ) : null}

        {!isError && pendingFixesData.length === 0 ? (
          <EmptyState message="No pending fixes found." />
        ) : null}

        {/* Table */}
        {pendingFixesData.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background: "#F9FAFB",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Repository
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Branch
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Error
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Risk
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pendingFixesData.map((fix) => (
                  <TableRow
                    key={fix.failureId}
                    onClick={() =>
                      navigate(`/failure?failure_id=${encodeURIComponent(fix.failureId)}`)
                    }
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s",
                      borderBottom: "1px solid #E5E7EB",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                      "&:hover": {
                        backgroundColor: "#F9FAFB",
                        "& .MuiTableCell-root": {
                          color: "#4F46E5",
                        },
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#111827",
                        py: 2.5,
                      }}
                    >
                      {fix.repository}
                    </TableCell>
                    <TableCell sx={{ color: "#6B7280", py: 2.5 }}>
                      {fix.branch}
                    </TableCell>
                    <TableCell sx={{ color: "#6B7280", py: 2.5 }}>
                      {fix.error}
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <StatusChip label={fix.risk} status={toStatus(fix.risk)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Stack>
    </Container>
  );
};

export default PendingFixes;
