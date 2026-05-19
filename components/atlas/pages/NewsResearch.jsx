import React from "react";
import MarketNewsWidget from "../components/toolkit/MarketNewsWidget";
import EarningsCalendar from "../components/toolkit/EarningsCalendar";
import AdvisorCalculators from "../components/toolkit/AdvisorCalculators";
import AdvisorNotes from "../components/toolkit/AdvisorNotes";
import LiveBusinessTV from "../components/toolkit/LiveBusinessTV";
import AdvisorQuickActions from "../components/toolkit/AdvisorQuickActions";

export default function AdvisorToolkit() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Advisor Toolkit</h1>
        <p className="text-sm text-slate-400 mt-1">Daily command center for market intelligence and client workflows</p>
      </div>

      {/* Row 1: Full-width Live TV */}
      <LiveBusinessTV />

      {/* Row 2: 3-column panel row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ minHeight: "520px" }}>
        <MarketNewsWidget />
        <AdvisorQuickActions />
        <AdvisorCalculators />
      </div>

      {/* Row 3: 2-column bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ minHeight: "420px" }}>
        <EarningsCalendar />
        <AdvisorNotes />
      </div>
    </div>
  );
}
