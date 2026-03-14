import React from "react";
import { Chip } from "@mui/material";

type StatusType = "success" | "warning" | "error" | "info";

interface StatusChipProps {
  label: string;
  status: StatusType;
}

const StatusChip: React.FC<StatusChipProps> = ({ label, status }) => {
  const getChipColor = (
    status: StatusType,
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "info":
        return "info";
      default:
        return "info";
    }
  };

  return <Chip label={label} color={getChipColor(status)} variant="outlined" />;
};

export default StatusChip;
