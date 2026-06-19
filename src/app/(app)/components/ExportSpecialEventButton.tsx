'use client'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV, downloadCSV } from './csv-export'

type Props = {
  slug: string
  name: string
  selectionOnly?: boolean
}

const ExportSpecialEventButton = ({ slug, name, selectionOnly }: Props) => {
  const handleClick = async () => {
    try {
      const events = await _getEvents({
        limit: 1000,
        specialEvent: slug,
        ...(selectionOnly ? { selectionOnly: true } : {}),
      })
      if (events.docs) {
        const filename = selectionOnly
          ? `events-${slug}-selection.csv`
          : `events-${slug}.csv`
        downloadCSV(filename, convertEventsToCSV(events.docs))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const label = selectionOnly
    ? `Tous les concerts sélectionnés de ${name}`
    : `Tous les concerts de ${name}`

  return (
    <div>
      <button onClick={handleClick} type="button">
        {label}
      </button>
    </div>
  )
}

export default ExportSpecialEventButton
