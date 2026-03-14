import React from "react";
import { Box, Stack } from "@mui/material";
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
} from "@mui/material";
import { Add as AddIcon, GitHub as GitHubIcon } from "@mui/icons-material";

interface Repo {
  name: string;
  provider: string;
  status: "Connected" | "Disconnected";
}

const Repositories: React.FC = () => {
  const repositories: Repo[] = [
    { name: "api-server", provider: "GitHub", status: "Connected" },
    { name: "worker-service", provider: "GitHub", status: "Connected" },
    { name: "auth-service", provider: "GitHub", status: "Disconnected" },
  ];

  const getStatusColor = (status: "Connected" | "Disconnected") => {
    return status === "Connected" ? "success" : "default";
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
            Repositories
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 16 }}>
            Manage connected repositories
          </Typography>
        </Box>

        {/* Action Button */}
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: "#4F46E5",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.5,
              borderRadius: "8px",
              transition: "all 0.3s",
              "&:hover": {
                background: "#6366F1",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 24px rgba(79, 70, 229, 0.3)",
              },
            }}
          >
            Connect Repository
          </Button>
        </Box>

        {/* Repositories Table */}
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
                  Provider
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
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {repositories.map((repo, index) => (
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
                    {repo.name}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280", py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GitHubIcon sx={{ fontSize: 18 }} />
                      {repo.provider}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={repo.status}
                      color={getStatusColor(repo.status)}
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

export default Repositories;
