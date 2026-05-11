'use client'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV } from './export-csv'

const ExportSpecialEvent = () => {
  const fetchOptions = async () => {
    try {
      const events = await _getEvents({
        limit: 1000,
        specialEvent: 'nouvel-an-2026',
      })
      if (events.docs) {
        const csvData = new Blob([convertEventsToCSV(events.docs)], {
          type: 'text/csv',
        })
        const csvURL = URL.createObjectURL(csvData)
        const link = document.createElement('a')
        link.href = csvURL
        link.download = 'events.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
