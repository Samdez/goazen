'use client'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV, downloadCSV } from './csv-export'

const ExportSpecialEventSelection = () => {
  const fetchOptions = async () => {
    try {
      const events = await _getEvents({
        limit: 1000,
        specialEvent: 'fetes-de-bayonne',
        selectionOnly: true,
      })
      if (events.docs) {
        downloadCSV('events-fetes-de-bayonne.csv', convertEventsToCSV(events.docs))
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
