import React from "react";

export default function App() {
  const [tab, setTab] = React.useState("dashboard");

  // Analytics state
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(false);
  const [errorAnalytics, setErrorAnalytics] = React.useState(null);

  // Fetch analytics data when 'analytics' tab is active
  React.useEffect(() => {
    if (tab === "analytics") {
      setLoadingAnalytics(true);
      setErrorAnalytics(null);
      fetch("https://YOUR_API_GATEWAY_URL/analytics") // Replace with your API endpoint
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch analytics");
          return res.json();
        })
        .then((data) => {
          setAnalyticsData(data);
          setLoadingAnalytics(false);
        })
        .catch((err) => {
          setErrorAnalytics(err.message);
          setLoadingAnalytics(false);
        });
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">CivicPulse AI</h1>
        <p className="text-gray-600">Kingston Civic Engagement Platform</p>
      </header>

      {/* Tabs */}
      <nav className="mb-4 flex space-x-4">
        {["dashboard", "chat", "issues", "analytics"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main>
        {tab === "dashboard" && <p>Dashboard content here...</p>}

        {tab === "chat" && <p>Chat interface here...</p>}

        {tab === "issues" && <p>Issue reporting here...</p>}

        {tab === "analytics" && (
          <>
            {loadingAnalytics && <p>Loading analytics data...</p>}
            {errorAnalytics && (
              <p className="text-red-600">Error: {errorAnalytics}</p>
            )}
            {analyticsData && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Analytics Overview</h2>
                <p>
                  Reports Over Last 7 Days:{" "}
                  {analyticsData.reportsOverTime.join(", ")}
                </p>
                <p>
                  Estimated Resolution Time:{" "}
                  {analyticsData.estimatedResolutionDays} days
                </p>
                <h3 className="mt-4 font-semibold">Issue Status Counts:</h3>
                <ul className="list-disc list-inside">
                  {Object.entries(analyticsData.issueStatusCounts).map(
                    ([status, count]) => (
                      <li key={status}>
                        {status}: {count}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
