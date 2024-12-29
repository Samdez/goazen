import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FormButton() {
  return (
    <div className="flex justify-center mb-4">
      <Link href={'/formulaire'}>
        <Button className="bg-[#ee2244bc] text-white h-16 w-64 text-3xl">
          Partage-nous ton event!
        </Button>
      </Link>
    </div>
  )
}
