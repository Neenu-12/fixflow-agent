import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
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
                Continue with your Google account to access the dashboard
              </Typography>

              <Stack spacing={3}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    isSigningIn ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />
                  }
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
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
                  {isSigningIn ? "Signing in..." : "Continue with Google"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
