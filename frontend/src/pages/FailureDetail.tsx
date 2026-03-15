import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS, buildFailuresUrl } from "../config/api";
import DiffViewer from "../components/DiffViewer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

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

interface ApiFileToModify {
  file?: string;
  original_content?: string;
  new_content?: string;
}

interface ApiFailureDetail {
  failure_id?: string;
  repo_name?: string;
  branch?: string;
  commit_sha?: string;
  root_cause?: string;
  confidence_score?: number | string;
  risk_score?: string;
  files_to_modify?: ApiFileToModify[];
}

const normalizeRisk = (risk?: string): string => {
  if (!risk) {
    return "Low";
  }

  const normalized = risk.toLowerCase();
  if (normalized === "high") {
    return "High";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  return "Low";
};

const confidenceLabel = (score: number): string => {
  if (score >= 90) {
    return "Very High";
  }

  if (score >= 75) {
    return "High";
  }

  if (score >= 60) {
    return "Medium";
  }

  return "Low";
};

const parsePayload = (payload: unknown): ApiFailureDetail | null => {
  if (Array.isArray(payload)) {
    return (payload[0] as ApiFailureDetail | undefined) || null;
  }

  if (payload && typeof payload === "object") {
    const payloadObj = payload as Record<string, unknown>;

    if (Array.isArray(payloadObj.data)) {
      return (payloadObj.data[0] as ApiFailureDetail | undefined) || null;
    }

    if (payloadObj.data && typeof payloadObj.data === "object") {
      return payloadObj.data as ApiFailureDetail;
    }

    if (typeof payloadObj.body === "string") {
      const parsedBody = JSON.parse(payloadObj.body) as unknown;
      return parsePayload(parsedBody);
    }

    if (typeof payloadObj.failure_id === "string") {
      return payloadObj as ApiFailureDetail;
    }
  }

  return null;
};

const buildDiffText = (change?: ApiFileToModify): { fileName: string; diffText: string } => {
  if (!change) {
    return {
      fileName: "no-file.txt",
      diffText: "No file changes available.",
    };
  }

  const fileName = change.file || "unknown-file";
  const originalLines = (change.original_content || "")
    .split("\n")
    .map((line) => `-${line}`)
    .join("\n");
  const updatedLines = (change.new_content || "")
    .split("\n")
    .map((line) => `+${line}`)
    .join("\n");

  return {
    fileName,
    diffText: `diff --git a/${fileName} b/${fileName}\n--- a/${fileName}\n+++ b/${fileName}\n@@\n${originalLines}\n${updatedLines}`,
  };
};

const fetchFailureDetail = async (failureId: string): Promise<ApiFailureDetail> => {
  const response = await fetch(buildFailuresUrl({ failure_id: failureId }), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch failure detail (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  const detail = parsePayload(payload);

  if (!detail) {
    throw new Error("Failure detail not found.");
  }

  return detail;
};

const FailureDetail: React.FC = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [searchParams] = useSearchParams();

  const failureId = searchParams.get("failure_id") || "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["failure-detail", failureId],
    queryFn: () => fetchFailureDetail(failureId),
    enabled: Boolean(failureId),
    staleTime: 60000,
  });

  const actionMutation = useMutation({
    mutationFn: (action: "approve" | "deny") =>
      fetch(API_ENDPOINTS.approve, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failure_id: failureId, action }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      }),
    onSuccess: (_data, action) => {
      setSnackbarSeverity("success");
      setSnackbarMessage(
        action === "approve" ? "Fix approved successfully." : "Fix denied successfully.",
      );
      setOpenSnackbar(true);
    },
    onError: (err) => {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        err instanceof Error ? err.message : "Unable to submit action.",
      );
      setOpenSnackbar(true);
    },
  });

  const repository = data?.repo_name || "Unknown repository";
  const branch = data?.branch || "Unknown";
  const commitSha = data?.commit_sha || "N/A";
  const rootCause = data?.root_cause || "No root cause provided.";
  const confidenceScore = Number(data?.confidence_score || 0);
  const riskLevel = normalizeRisk(data?.risk_score);
  const { fileName, diffText } = buildDiffText(data?.files_to_modify?.[0]);

  const handleApproveFix = () => actionMutation.mutate("approve");
  const handleRejectFix = () => actionMutation.mutate("deny");

  if (!failureId) {
    return <EmptyState message="No failure selected. Open from the Pending Fixes list." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading failure details..." />;
  }

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

        {isError ? (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : "Unable to load failure detail."}
          </Alert>
        ) : null}

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
                    {repository}
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

                  <Typography fontWeight={600}>{branch}</Typography>
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
                    {commitSha}
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

                  <Typography fontSize={15}>{rootCause}</Typography>
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
                        {confidenceScore}%
                      </Typography>

                      <Chip
                        label={confidenceLabel(confidenceScore)}
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
                      <Typography fontWeight={700}>{riskLevel}</Typography>

                      <Chip
                        label={riskLevel}
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
                  AI-generated patch with {confidenceScore}% confidence
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
                fileName={fileName}
                diffText={diffText}
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
            disabled={actionMutation.isPending}
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
            {actionMutation.isPending && actionMutation.variables === "approve"
              ? "Approving..."
              : "Approve Fix"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RejectIcon />}
            onClick={handleRejectFix}
            disabled={actionMutation.isPending}
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
            {actionMutation.isPending && actionMutation.variables === "deny"
              ? "Denying..."
              : "Deny"}
          </Button>
        </Stack>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
};

export default FailureDetail;
