import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — SenLinks",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch all links with aggregated click data
  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { clicks: "desc" },
    select: {
      id: true,
      title: true,
      clicks: true,
      clickLogs: {
        select: {
          createdAt: true,
          country: true,
          device: true,
          referrer: true,
        },
      },
    },
  });

  // Total clicks
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  // Per-link chart data
  const linkData = links.map((l) => ({
    name: l.title.length > 18 ? l.title.slice(0, 18) + "…" : l.title,
    clicks: l.clicks,
  }));

  // All click logs
  const allLogs = links.flatMap((l) => l.clickLogs);

  // Timeline: last 14 days
  const now = new Date();
  const timelineData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const clicks = allLogs.filter(
      (log) => log.createdAt >= dayStart && log.createdAt <= dayEnd
    ).length;
    return { date: dateStr, clicks };
  });

  // Device breakdown
  const deviceCounts: Record<string, number> = {};
  allLogs.forEach((log) => {
    const d = log.device ?? "unknown";
    deviceCounts[d] = (deviceCounts[d] ?? 0) + 1;
  });
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Country breakdown (top 6)
  const countryCounts: Record<string, number> = {};
  allLogs.forEach((log) => {
    const c = log.country ?? "Unknown";
    countryCounts[c] = (countryCounts[c] ?? 0) + 1;
  });
  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  return (
    <AnalyticsClient
      totalClicks={totalClicks}
      linkCount={links.length}
      linkData={linkData}
      timelineData={timelineData}
      deviceData={deviceData}
      countryData={countryData}
    />
  );
}
