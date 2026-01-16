// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(cors());

app.get("/api/analytics", (req, res) => {
  res.json({
    totalReports: 847,
    resolvedThisWeek: 42,
    avgResponseTime: "2.3 days",
    citizenSatisfaction: 87,
    activeIssues: 156,
  });
});

app.listen(port, () => {
  console.log(`Mock backend listening at http://localhost:${port}`);
});

