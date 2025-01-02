'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateSchema } from '../form.client'
import { useTsController } from '@ts-react/form'
import { z } from 'zod'
import { fr } from 'date-fns/locale'

export function DatePicker() {
  const {
    field: { onChange, value },
    error,
  } = useTsController<z.infer<typeof DateSchema>>()

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-fit justify-start text-left font-normal',
              !value?.date && 'text-muted-foreground',
              error?.errorMessage && 'border-red-500',
            )}
          >
            <CalendarIcon />
            {value?.date ? format(value.date, 'PPP') : <span>Date de l&apos;évènement</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value?.date}
            onSelect={(date) =>
              onChange({
                ...value,
                date,
              })
            }
            initialFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>
      {error?.errorMessage && <span className="text-red-500">{error?.errorMessage}</span>}
    </>
  )
}
