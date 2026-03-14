import React from "react";
import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data available.",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        padding: 2,
      }}
    >
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ textAlign: "center" }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
