import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, Button, Card, Container, Stack, Typography } from "@mui/material";
import {
  GitHub as GitHubIcon,
  Google as GoogleIcon,
} from "@mui/icons-material";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingX: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            {/* Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                px: 4,
                py: 6,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#fff",
                  mb: 1,
                }}
              >
                FixFlow AI
              </Typography>

              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                Fix CI failures with AI
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ px: 4, py: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  mb: 2,
                  color: "#111827",
                }}
              >
                Sign in
              </Typography>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "#6B7280",
                  mb: 6,
                  fontSize: 14,
                }}
              >
                Continue with your account to access the dashboard
              </Typography>

              <Stack spacing={3}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GitHubIcon />}
                  onClick={handleLogin}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#4F46E5",
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                    "&:hover": {
                      backgroundColor: "#6366F1",
                      boxShadow: "0 6px 16px rgba(79,70,229,0.35)",
                    },
                  }}
                >
                  Continue with GitHub
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={handleLogin}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 15,
                    borderColor: "#D1D5DB",
                    color: "#111827",
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "rgba(79,70,229,0.05)",
                      borderColor: "#4F46E5",
                    },
                  }}
                >
                  Continue with Google
                </Button>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  display: "block",
                  mt: 4,
                  color: "#9CA3AF",
                }}
              >
                By signing in, you agree to our Terms and Privacy Policy
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
