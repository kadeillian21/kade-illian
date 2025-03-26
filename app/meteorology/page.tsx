export default function MeteorologyPage() {
  // SPC Colors
  const spcColors = {
    thunderstorm: '#C0E8C0',  // General Thunderstorm Risk (light green)
    marginal: '#7FC57F',      // Marginal Risk (darker green)
    slight: '#F6F67F',        // Slight Risk (yellow)
    enhanced: '#E6C27F',      // Enhanced Risk (orange/tan)
    moderate: '#E67F7F',      // Moderate Risk (red)
    high: '#FF7FFF',          // High Risk (magenta)
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: spcColors.moderate }}>Meteorology</h1>
      <div className="mt-6 space-y-4">
        <p>Welcome to the Meteorology section. Explore the links in the dropdown menu.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md" 
               style={{ borderColor: spcColors.thunderstorm }}>
            <h2 className="text-xl font-meokdium" style={{ color: spcColors.enhanced }}>SPC Outlook History</h2>
            <p className="mt-2 text-gray-600">Explore historical Storm Prediction Center outlook data.</p>
            <a 
              href="/meteorology/spc-outlook-history" 
              className="mt-4 inline-block rounded-md px-4 py-2 text-sm font-medium text-gray-800"
              style={{ backgroundColor: spcColors.slight }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = spcColors.enhanced;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = spcColors.slight;
                e.currentTarget.style.color = '#1F2937'; // text-gray-800
              }}
            >
              View SPC Outlook History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}