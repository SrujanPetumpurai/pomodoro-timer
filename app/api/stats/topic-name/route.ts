import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "all"; // "week" | "month" | "all"

  let dateFilter: Date | undefined;
  const now = new Date();
  if (range === "week") {
    dateFilter = new Date(now);
    dateFilter.setDate(now.getDate() - 7);
  } else if (range === "month") {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 1);
  }

  const grouped = await prisma.focusSession.groupBy({
    by: ["topicId"],
    where: {
      userId: session.user.id,
      ...(dateFilter && { date: { gte: dateFilter } }),
    },
    _sum: { duration: true },
    _count: { _all: true },
  });

  const topicIds = grouped
    .map((g) => g.topicId)
    .filter((id): id is string => id !== null);

  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: { id: true, name: true, color: true },
  });
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  const result = grouped
    .map((g) => {
      const topic = g.topicId ? topicMap.get(g.topicId) : null;
      return {
        topicId: g.topicId,
        name: topic?.name ?? "Uncategorized",
        color: topic?.color ?? "#888888",
        totalMinutes: g._sum.duration ?? 0,
        sessionCount: g._count._all,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const totalMinutes = result.reduce((sum, r) => sum + r.totalMinutes, 0);

  return NextResponse.json({ range, totalMinutes, topics: result });
}