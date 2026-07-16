import { auth } from '@/auth'
import { getTimeByTopic } from '@/lib/data/focusSessions'

export default async function Topics({ topicId }: { topicId?: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return <div>Login to see time spent on particular topics</div>
  }

  const timeByTopic = await getTimeByTopic(session.user.id, { topicId })

  if (timeByTopic.length === 0) {
    return <div>No focus sessions yet.</div>
  }

  return (
    <div>
      {timeByTopic.map((t) => (
        <div key={t.topicId ?? 'no-topic'}>
          <span>{t.topicId ?? 'Uncategorized'}</span>
          <span>{t._sum.duration ?? 0} min</span>
          <span>{t._count._all} sessions</span>
        </div>
      ))}
    </div>
  )
}