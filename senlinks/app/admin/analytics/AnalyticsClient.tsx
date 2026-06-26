"use client";

import AnalyticsChart from "@/components/AnalyticsChart";

interface Props {
  totalClicks: number;
  linkCount: number;
  linkData: { name: string; clicks: number }[];
  timelineData: { date: string; clicks: number }[];
  deviceData: { name: string; value: number }[];
  countryData: { name: string; value: number }[];
}

export default function AnalyticsClient({
  totalClicks,
  linkCount,
  linkData,
  timelineData,
  deviceData,
  countryData,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Overview of all link clicks
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded p-4">
          <p className="text-xs text-[#6B7280] mb-1">Total Clicks</p>
          <p className="text-3xl font-bold text-[#1E3A8A]">{totalClicks}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded p-4">
          <p className="text-xs text-[#6B7280] mb-1">Total Links</p>
          <p className="text-3xl font-bold text-[#1E3A8A]">{linkCount}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-[#6B7280] mb-1">Avg. Clicks / Link</p>
          <p className="text-3xl font-bold text-[#1E3A8A]">
            {linkCount > 0 ? (totalClicks / linkCount).toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <AnalyticsChart
        type="line"
        data={timelineData}
        title="Clicks — Last 14 Days"
      />

      {/* Per-link breakdown */}
      {linkData.length > 0 && (
        <AnalyticsChart
          type="bar"
          data={linkData}
          title="Clicks per Link"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Device breakdown */}
        {deviceData.length > 0 && (
          <AnalyticsChart
            type="pie"
            data={deviceData}
            title="Device Breakdown"
          />
        )}

        {/* Country breakdown */}
        {countryData.length > 0 && (
          <AnalyticsChart
            type="pie"
            data={countryData}
            title="Top Countries"
          />
        )}
      </div>

      {totalClicks === 0 && (
        <div className="text-center py-12 border border-dashed border-[#E5E7EB] rounded bg-white">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm font-medium text-[#111827]">No click data yet</p>
          <p className="text-xs text-[#6B7280] mt-1">
            Share your profile link to start seeing analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
