import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { computeStreakUpdate, toDateBucket } from "@/lib/gamification";

const VALID_TYPES = ["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const;

/**
 * Call this when a timer interval actually finishes (not on start).
 * Body: { type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK", durationSec: number, topicId?: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { type, durationSec, topicId } = await req.json();

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
  }
  if (!durationSec || typeof durationSec !== "number" || durationSec <= 0) {
    return NextResponse.json({ error: "Invalid durationSec" }, { status: 400 });
  }

  // Verify topic belongs to this user, if provided (only meaningful for FOCUS sessions)
  if (topicId) {
    const topic = await prisma.topic.findFirst({ where: { id: topicId, userId } });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
  }

  const now = new Date();
  const log = await prisma.pomodoroLog.create({
    data: {
      userId,
      topicId: type === "FOCUS" ? topicId ?? null : null,
      type,
      durationSec,
      completedAt: now,
      date: toDateBucket(now),
    },
  });

  // Streak + lifetime focus count only advance on completed FOCUS sessions
  let updatedUser = null;
  if (type === "FOCUS") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const { newStreak, newLastActiveDate } = computeStreakUpdate(
      user?.lastActiveDate ?? null,
      user?.currentStreak ?? 0,
      now
    );

    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalFocusCount: { increment: 1 },
        currentStreak: newStreak,
        longestStreak: { set: Math.max(newStreak, user?.longestStreak ?? 0) },
        lastActiveDate: newLastActiveDate,
      },
    });
  }

  return NextResponse.json({ log, user: updatedUser }, { status: 201 });
}