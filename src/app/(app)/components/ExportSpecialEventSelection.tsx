'use client'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV } from './export-csv'

const ExportSpecialEventSelection = () => {
  const fetchOptions = async () => {
    try {
      const events = await _getEvents({
        limit: 1000,
        specialEvent: 'fetes-de-bayonne',
        selectionOnly: true,
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
        Tous les concerts sélectionnés des Fêtes de Bayonne
      </button>
    </div>
  )
}

export default ExportSpecialEventSelection
