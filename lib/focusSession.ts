'use server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function logFocusSession(topicId: string | null) {
  const session = await auth()
  if (!session?.user?.id) return null 

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return prisma.focusSession.create({
    data: {
      userId: session.user.id,
      topicId: topicId ?? undefined,
      duration: 25,
      date: today,
    },
  })
}