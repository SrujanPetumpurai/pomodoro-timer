import { prisma } from '@/lib/prisma'

export async function getTimeByTopic(
  userId: string,
  opts?: { topicId?: string; dateRange?: { gte: Date; lte?: Date } }
) {
  return prisma.focusSession.groupBy({
    by: ['topicId'],
    where: {
      userId,
      ...(opts?.topicId && { topicId: opts.topicId }),
      ...(opts?.dateRange && { date: opts.dateRange }),
    },
    _sum: { duration: true },
    _count: { _all: true },
  })
}