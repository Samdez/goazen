'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { ContactFormBlock } from './ContactFormBlock'

export function ContactDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Discutons-en!
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] sm:h-[80vh] sm:max-h-[800px] flex flex-col">
        <DialogHeader className="px-6">
          <DialogTitle>Discutons-en!</DialogTitle>
          <DialogDescription className="font-text">
            Vous avez un projet ? Nous sommes là pour vous aider à le réaliser.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col px-6 py-2 justify-center overflow-y-auto">
          <ContactFormBlock onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
