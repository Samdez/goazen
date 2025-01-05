import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { createPena } from '../api/queries/supabase/create-pena'

export default function CreatePenaGirlsAlert({
  userId,
  eventId,
}: {
  userId: number
  eventId: number
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-64 h-16 text-2xl">Créer une peña féminine</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cette fonctionnalité est réservée aux filles et minorités de genre
          </AlertDialogTitle>
          <AlertDialogDescription>
            En créant ou rejoignant une peña féminine, vous certifiez vous identifier au genre
            féminin et/ou à une minorité de genre. Tout abus entrainera une radiation permanente du
            site.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => createPena({ userId, eventId, isGirls: true })}>
            Continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
