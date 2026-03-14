import React from "react";
import StatusChip from "../components/StatusChip";
import { useNavigate } from "react-router-dom";
import {
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
  repository: string;
  branch: string;
  error: string;
  risk: "Low" | "Medium" | "High";
}

const PendingFixes: React.FC = () => {
  const navigate = useNavigate();

  const pendingFixesData: PendingFix[] = [
    {
      repository: "api-server",
      branch: "main",
      error: "Missing dependency",
      risk: "Medium",
    },
    {
      repository: "worker",
      branch: "main",
      error: "Lint error",
      risk: "Low",
    },
    {
      repository: "auth-service",
      branch: "dev",
      error: "Syntax error",
      risk: "High",
    },
  ];

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

        {/* Table */}
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
              {pendingFixesData.map((fix, index) => (
                <TableRow
                  key={index}
                  onClick={() => navigate(`/failure/${fix.repository}`)}
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
                    <StatusChip
                      label={fix.risk}
                      status={
                        fix.risk === "High"
                          ? "error"
                          : fix.risk === "Medium"
                            ? "warning"
                            : "success"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
};

export default PendingFixes;
