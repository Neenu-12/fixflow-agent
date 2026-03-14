import React from "react";
import { Box, Stack } from "@mui/material";
import {
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

interface ActiveFix {
  repository: string;
  branch: string;
  ciStatus: "Running" | "Passed" | "Failed";
}

const ActiveFixes: React.FC = () => {
  const activeFixesData: ActiveFix[] = [
    {
      repository: "api-server",
      branch: "ai-fix/run123",
      ciStatus: "Running",
    },
    {
      repository: "worker",
      branch: "ai-fix/run124",
      ciStatus: "Running",
    },
  ];

  const getChipColor = (
    status: "Running" | "Passed" | "Failed",
  ): "warning" | "success" | "error" => {
    switch (status) {
      case "Running":
        return "warning";
      case "Passed":
        return "success";
      case "Failed":
        return "error";
      default:
        return "warning";
    }
  };

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
            Active Fixes
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Fixes currently running in CI
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
                  CI Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeFixesData.map((fix, index) => (
                <TableRow
                  key={index}
                  sx={{
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
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={fix.ciStatus}
                      color={getChipColor(fix.ciStatus)}
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
        </TableContainer>
      </Stack>
    </Container>
  );
};

export default ActiveFixes;
