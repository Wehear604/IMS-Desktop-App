import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// rows: array of { label, value }
// columns: 1 or 2 (default 2)
// stacked: if true, array values are shown as stacked lines
const InfoTable = ({ rows = [], columns = 2, stacked = true, ...props }) => {
  // Split rows for two-column layout
  let leftRows = rows, rightRows = [];
  if (columns === 2) {
    const mid = Math.ceil(rows.length / 2);
    leftRows = rows.slice(0, mid);
    rightRows = rows.slice(mid);
    // Pad for alignment
    const maxRows = Math.max(leftRows.length, rightRows.length);
    while (leftRows.length < maxRows) leftRows.push({ label: "", value: "" });
    while (rightRows.length < maxRows) rightRows.push({ label: "", value: "" });
  }

  // Helper for stacked rendering
  const renderValue = (value) => {
    if (stacked && Array.isArray(value)) {
      if (!value.length) return "-";
      return (
        <div>
          {value.map((v, i) => (
            <div key={i}>{v}</div>
          ))}
        </div>
      );
    }
    return value ?? "-";
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', ...props.sx }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {columns === 2
              ? leftRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "bold", padding: 8, border: "1px solid #eee", width: "15%", background: "#fafbfc", verticalAlign: "top" }}>
                      {row.label}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #eee", width: "35%", verticalAlign: "top" }}>
                      {renderValue(row.value)}
                    </td>
                    <td style={{ fontWeight: "bold", padding: 8, border: "1px solid #eee", width: "15%", background: "#fafbfc", verticalAlign: "top" }}>
                      {rightRows[idx].label}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #eee", width: "35%", verticalAlign: "top" }}>
                      {renderValue(rightRows[idx].value)}
                    </td>
                  </tr>
                ))
              : rows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "bold", padding: 8, border: "1px solid #eee", width: "30%" }}>
                      {row.label}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #eee" }}>
                      {renderValue(row.value)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

export default InfoTable;
