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

interface ResolvedFix {
  repository: string;
  fixApplied: string;
  result: "Success" | "Failed";
}

const ResolvedFixes: React.FC = () => {
  const resolvedFixesData: ResolvedFix[] = [
    {
      repository: "api-server",
      fixApplied: "Add pandas dependency",
      result: "Success",
    },
    {
      repository: "worker",
      fixApplied: "Fix lint formatting",
      result: "Success",
    },
  ];

  const getChipColor = (result: "Success" | "Failed"): "success" | "error" => {
    switch (result) {
      case "Success":
        return "success";
      case "Failed":
        return "error";
      default:
        return "success";
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
            Resolved Fixes
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Successfully applied fixes
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
              {resolvedFixesData.map((fix, index) => (
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
        </TableContainer>
      </Stack>
    </Container>
  );
};

export default ResolvedFixes;
