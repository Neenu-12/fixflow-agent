import React from "react";
import { Paper, Typography, Box } from "@mui/material";

interface DiffViewerProps {
  fileName: string;
  diffText: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ fileName, diffText }) => {
  const lines = diffText.split("\n");

  return (
    <Paper sx={{ padding: 2, backgroundColor: "#fafafa" }}>
      <Typography
        variant="subtitle2"
        sx={{ marginBottom: 1, fontWeight: "bold" }}
      >
        {fileName}
      </Typography>

      <Box
        sx={{
          fontFamily: "monospace",
          fontSize: "0.875rem",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          overflow: "auto",
        }}
      >
        {lines.map((line, index) => {
          let bgColor = "transparent";

          if (line.startsWith("+")) bgColor = "#e8f5e9";
          if (line.startsWith("-")) bgColor = "#ffebee";

          return (
            <Box
              key={index}
              sx={{
                padding: "4px 8px",
                backgroundColor: bgColor,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {line}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default DiffViewer;
