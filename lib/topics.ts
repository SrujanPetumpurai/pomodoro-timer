'use server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUserTopics() {
  const session = await auth()
  if (!session?.user?.id) return []
  return prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createTopic(name: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const topic = await prisma.topic.create({
    data: { userId: session.user.id, name: name.trim() },
  })
  revalidatePath('/')
  return topic
}