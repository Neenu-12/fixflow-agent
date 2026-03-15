import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { buildFailuresUrl } from "../config/api";
import DiffViewer from "../components/DiffViewer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

import {
  Alert,
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  CheckCircle,
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

const parsePayload = (payload: unknown): ApiFailureDetail | null => {
  if (Array.isArray(payload)) return (payload[0] as ApiFailureDetail) || null;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return (obj.data[0] as ApiFailureDetail) || null;
    if (obj.data && typeof obj.data === "object") return obj.data as ApiFailureDetail;
    if (typeof obj.body === "string") return parsePayload(JSON.parse(obj.body));
    if (typeof obj.failure_id === "string") return obj as ApiFailureDetail;
  }
  return null;
};

const fetchDetail = async (failureId: string): Promise<ApiFailureDetail> => {
  const res = await fetch(buildFailuresUrl({ failure_id: failureId }), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch detail (${res.status})`);
  const detail = parsePayload((await res.json()) as unknown);
  if (!detail) throw new Error("Resolved fix detail not found.");
  return detail;
};

const normalizeRisk = (risk?: string): string => {
  const r = (risk || "").toLowerCase();
  if (r === "high") return "High";
  if (r === "medium") return "Medium";
  return "Low";
};

const confidenceLabel = (score: number): string => {
  if (score >= 90) return "Very High";
  if (score >= 75) return "High";
  if (score >= 60) return "Medium";
  return "Low";
};

const buildDiffText = (
  change?: ApiFileToModify,
): { fileName: string; diffText: string } => {
  if (!change) return { fileName: "no-file.txt", diffText: "No file changes available." };
  const fileName = change.file || "unknown-file";
  const originalLines = (change.original_content || "")
    .split("\n")
    .map((l) => `-${l}`)
    .join("\n");
  const updatedLines = (change.new_content || "")
    .split("\n")
    .map((l) => `+${l}`)
    .join("\n");
  return {
    fileName,
    diffText: `diff --git a/${fileName} b/${fileName}\n--- a/${fileName}\n+++ b/${fileName}\n@@\n${originalLines}\n${updatedLines}`,
  };
};

const ResolvedFixDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const failureId = searchParams.get("failure_id") || "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["resolved-fix-detail", failureId],
    queryFn: () => fetchDetail(failureId),
    enabled: Boolean(failureId),
    staleTime: 60000,
  });

  const repository = data?.repo_name || "Unknown repository";
  const branch = data?.branch || "Unknown";
  const commitSha = data?.commit_sha || "N/A";
  const rootCause = data?.root_cause || "No root cause provided.";
  const confidenceScore = Number(data?.confidence_score || 0);
  const riskLevel = normalizeRisk(data?.risk_score);
  const { fileName, diffText } = buildDiffText(data?.files_to_modify?.[0]);

  if (!failureId) {
    return <EmptyState message="No fix selected. Open from the Resolved Fixes list." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading resolved fix details..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BugIcon sx={{ fontSize: 28, color: "#10B981" }} />
            <Typography variant="h4" fontWeight={800} color="#111827">
              Resolved Fix Detail
            </Typography>
          </Stack>
          <Typography color="#6B7280" fontSize={16} mt={1}>
            This fix has been approved and the PR was created
          </Typography>
        </Box>

        {/* Applied badge */}
        <Box>
          <Chip
            icon={<CheckCircle sx={{ fontSize: 16 }} />}
            label="Fix Applied — PR Created"
            sx={{
              background: "#D1FAE5",
              color: "#065F46",
              fontWeight: 700,
              fontSize: 13,
              px: 1,
              height: 32,
            }}
          />
        </Box>

        {isError && (
          <Alert severity="error">
            {error instanceof Error ? error.message : "Unable to load fix detail."}
          </Alert>
        )}

        {/* Info Grid */}
        <Grid container spacing={3}>
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
                  <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
                    Repository
                  </Typography>
                  <Typography fontWeight={600} fontSize={16}>{repository}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
                    Branch
                  </Typography>
                  <Typography fontWeight={600}>{branch}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#10B981",
                  boxShadow: "0 8px 16px rgba(16,185,129,0.12)",
                },
              }}
            >
              <Typography fontWeight={700} mb={3}>
                Fix Summary
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
                    Root Cause
                  </Typography>
                  <Typography fontSize={15}>{rootCause}</Typography>
                </Box>
                <Box
                  sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
                >
                  <Box>
                    <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
                      Confidence
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700} fontSize={24}>
                        {confidenceScore}%
                      </Typography>
                      <Chip
                        label={confidenceLabel(confidenceScore)}
                        size="small"
                        sx={{ background: "#DBEAFE", color: "#0369A1", fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                  <Box>
                    <Typography fontSize={12} color="#9CA3AF" fontWeight={600} textTransform="uppercase">
                      Risk Level
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700}>{riskLevel}</Typography>
                      <Chip
                        label={riskLevel}
                        size="small"
                        sx={{ background: "#FEF3C7", color: "#92400E", fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Applied Diff */}
        <Paper
          sx={{
            p: 4,
            border: "2px solid #10B981",
            borderRadius: 3,
            "&:hover": { boxShadow: "0 12px 24px rgba(16,185,129,0.15)" },
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CheckCircle sx={{ color: "#10B981" }} />
              <Box>
                <Typography fontWeight={700}>Applied Patch</Typography>
                <Typography fontSize={13} color="#6B7280">
                  Changes committed with {confidenceScore}% confidence
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
              <DiffViewer fileName={fileName} diffText={diffText} />
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ResolvedFixDetail;
