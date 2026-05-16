'use client'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV, downloadCSV } from './csv-export'

const ExportSpecialEvent = () => {
  const fetchOptions = async () => {
    try {
      const events = await _getEvents({ limit: 1000, specialEvent: 'nouvel-an-2026' })
      if (events.docs) {
        downloadCSV('events-nouvel-an-2026.csv', convertEventsToCSV(events.docs))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div>
      <button onClick={fetchOptions} type="button">
        Tous les concerts du Nouvel An 2026
      </button>
    </div>
  )
}

export default ExportSpecialEvent
