import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { buildFailuresUrl } from "../config/api";
import { Box, Stack } from "@mui/material";
import {
  Alert,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

interface ResolvedFix {
  failureId: string;
  repository: string;
  fixApplied: string;
  result: "Success" | "Failed";
}

interface ApiFailure {
  failure_id?: string;
  repo_name?: string;
  root_cause?: string;
}

const normalizePayload = (payload: unknown): ApiFailure[] => {
  if (Array.isArray(payload)) return payload as ApiFailure[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as ApiFailure[];
    if (typeof obj.body === "string") {
      const parsed = JSON.parse(obj.body) as unknown;
      if (Array.isArray(parsed)) return parsed as ApiFailure[];
    }
  }
  return [];
};

const fetchResolvedFixes = async (): Promise<ResolvedFix[]> => {
  const res = await fetch(buildFailuresUrl({ status: "approved" }), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch resolved fixes (${res.status})`);
  const payload = (await res.json()) as unknown;
  return normalizePayload(payload).map((f, i) => ({
    failureId: f.failure_id || `${f.repo_name || "repo"}-${i}`,
    repository: f.repo_name || "Unknown repository",
    fixApplied: f.root_cause || "Fix applied",
    result: "Success" as const,
  }));
};

const getChipColor = (result: "Success" | "Failed"): "success" | "error" =>
  result === "Success" ? "success" : "error";

const ResolvedFixes: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: resolvedFixesData = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resolved-fixes"],
    queryFn: fetchResolvedFixes,
    refetchInterval: 1800000,
    staleTime: 60000,
  });

  if (isLoading) {
    return <LoadingState message="Loading resolved fixes..." />;
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
            Resolved Fixes
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Successfully applied fixes
          </Typography>
        </Box>

        {isError && (
          <Alert severity="error">
            {error instanceof Error ? error.message : "Unable to fetch resolved fixes."}
          </Alert>
        )}

        {!isError && resolvedFixesData.length === 0 && (
          <EmptyState message="No resolved fixes found." />
        )}

        {/* Table */}
        {resolvedFixesData.length > 0 && <TableContainer
          component={Paper}
          sx={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Table>
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
                  Fix Applied
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
                  Result
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resolvedFixesData.map((fix) => (
                <TableRow
                  key={fix.failureId}
                  onClick={() =>
                    navigate(`/resolved-detail?failure_id=${encodeURIComponent(fix.failureId)}`)
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
                    {fix.fixApplied}
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={fix.result}
                      color={getChipColor(fix.result)}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        height: 28,
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>}
      </Stack>
    </Container>
  );
};

export default ResolvedFixes;
