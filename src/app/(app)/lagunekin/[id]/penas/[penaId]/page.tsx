import MessageComponent from '@/app/(app)/components/Message'
import { getMessages } from '@/app/(app)/api/queries/supabase/get-messages'
import { auth } from '@clerk/nextjs/server'
import { getUserWithClerkId, getUserWithId } from '@/app/(app)/api/queries/supabase/get-user'
import { getEvent } from '@/app/(app)/api/queries/payload/get-event'
import { getEventFromDB } from '@/app/(app)/api/queries/supabase/get-event'
import { getPena } from '@/app/(app)/api/queries/supabase/get-pena'

export default async function PenaPage({
  params,
}: {
  params: Promise<{ id: string; penaId: string }>
}) {
  const { id: eventId, penaId } = await params
  const user = await auth()
  if (!user.userId) {
    return <div>You are not logged in</div>
  }
  const { id: userId } = await getUserWithClerkId(user.userId)
  const pena = await getPena(parseInt(penaId))

  const [memberOne, memberTwo, memberThree, memberFour, messages, event] = await Promise.all([
    pena.memberOneId ? getUserWithId(pena.memberOneId) : null,
    pena.memberTwoId ? getUserWithId(pena.memberTwoId) : null,
    pena.memberThreeId ? getUserWithId(pena.memberThreeId) : null,
    pena.memberFourId ? getUserWithId(pena.memberFourId) : null,
    getMessages(parseInt(penaId)),
    getEventFromDB({ eventId: parseInt(eventId) }),
  ])

  const payloadEvent = await getEvent(event.payloadId)
  return (
    <>
      <div className="flex flex-col gap-4 p-4 justify-center">
        <p className="text-center text-2xl font-bold">
          Bienvenue dans votre pena pour : <br />
          {payloadEvent.title}
        </p>
        {!memberTwo ? (
          <p>Il n&apos;y a pas d&apos;autre membre dans cette pena pour l&apos;instant</p>
        ) : (
          <div className="flex justify-start gap-2">
            Les membres de cette pena sont :
            <div>
              {memberOne?.firstName} {memberOne?.lastName?.slice(0, 1)}
            </div>{' '}
            {memberTwo && (
              <div>
                / {memberTwo?.firstName} {memberTwo?.lastName?.slice(0, 1)}
              </div>
            )}
            {memberThree && (
              <div>
                / {memberThree?.firstName} {memberThree?.lastName?.slice(0, 1)}
              </div>
            )}
            {memberFour && (
              <div>
                / {memberFour?.firstName} {memberFour?.lastName?.slice(0, 1)}
              </div>
            )}
          </div>
        )}
      </div>
      <MessageComponent initialMessages={messages} penaId={parseInt(penaId)} userId={userId} />
    </>
  )
}
