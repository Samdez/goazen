'use client'

import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'

export default function SelectionSwitch({
  selectionOnly,
  slug,
}: {
  selectionOnly: boolean
  slug: string
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <p>Tous les concerts</p>
      <Switch
        checked={selectionOnly}
        onCheckedChange={() =>
          router.push(`/concerts/evenement/${slug}?selectionOnly=${!selectionOnly}`)
        }
      />
      <p>Notre sélection</p>
    </div>
  )
}
