exports.handler = async (event) => {
  // Sample analytics data - replace with real DB queries as needed
  const data = {
    reportsOverTime: [12, 25, 18, 40, 30, 35, 45], // last 7 days
    issueStatusCounts: {
      Pending: 10,
      "In Progress": 20,
      Resolved: 50,
    },
    estimatedResolutionDays: 3,
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // CORS for frontend
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};
