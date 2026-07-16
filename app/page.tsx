import { auth } from '@/auth'
import Timer from './components/Timer'
import TopicTimeBreakdown from './components/TopicTimeBreakdown'

export default async function Page() {
  const session = await auth()

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full px-4">
      <Timer session={session} />
      <TopicTimeBreakdown />
    </div>
  )
}