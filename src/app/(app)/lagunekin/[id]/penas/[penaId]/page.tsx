import MessageComponent from '@/app/(app)/components/Message'
import { Message } from '@/app/(app)/api/db/schema'
import { getMessages } from '@/app/(app)/api/queries/supabase/get-messages'
import { auth } from '@clerk/nextjs/server'
import { getUserWithClerkId } from '@/app/(app)/api/queries/supabase/get-user'

export default async function PenaPage({
  params,
}: {
  params: Promise<{ eventId: string; penaId: string }>
}) {
  const user = await auth()
  if (!user.userId) {
    return <div>You are not logged in</div>
  }
  const { id: userId } = await getUserWithClerkId(user.userId)
  const penaId = (await params).penaId
  const messages = await getMessages(parseInt(penaId))
  return <MessageComponent initialMessages={messages} penaId={parseInt(penaId)} userId={userId} />
}
