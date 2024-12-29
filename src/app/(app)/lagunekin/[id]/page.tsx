import { auth } from '@clerk/nextjs/server'
import { UserHasNoPena } from '../../components/UserHasNoPena'
import UserHasPena from '../../components/UserHasPena'
import CreatePena from '../../components/CreatePenaButton'
import { getEventFromDB } from '../../api/queries/supabase/get-event'
import { findPenaWithMissingMembers } from '../../api/queries/supabase/get-pena-with-missing-members'
import { getUserWithClerkId } from '../../api/queries/supabase/get-user'
import { findUserPena } from '../../api/queries/supabase/get-user-pena'
import { getPenasFromEventId } from '../../api/queries/supabase/get-penas'

async function LagunekinPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const idParams = (await params).id

  if (!userId) {
    return <p>Vous devez être connecté pour accéder à cette page</p>
  }

  const [user, eventFromDB] = await Promise.all([
    getUserWithClerkId(userId),
    getEventFromDB({ eventId: parseInt(idParams) }),
  ])

  const existingPenas = await getPenasFromEventId(eventFromDB.id)
  if (!existingPenas.length) {
    return <NoExistingPenas userId={user.id} eventId={eventFromDB.id} />
  }

  const userPena = await findUserPena(user.id, eventFromDB.id)
  if (userPena.length) {
    return <UserHasPena penaId={userPena[0].id} eventId={eventFromDB.id} />
  }

  const missingMembersPenas = await findPenaWithMissingMembers(eventFromDB.id)
  return (
    <UserHasNoPena
      existingPenasNumber={existingPenas.length}
      penaId={missingMembersPenas[0].id}
      userId={user.id}
      eventId={idParams}
    />
  )
}

function NoExistingPenas({ userId, eventId }: { userId: number; eventId: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <p className="text-2xl font-bold">Il n&apos;y a pas encore de pena pour cet évènement</p>
      <CreatePena userId={userId} eventId={eventId} />
    </div>
  )
}

export default LagunekinPage
