'use client'
import { endOfWeek, startOfWeek } from 'date-fns'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV, downloadCSV } from './csv-export'

const ExportComponent = ({ region }: { region: 'pays-basque' | 'landes' }) => {
  const fetchOptions = async () => {
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 2 }).toISOString()
      const endDate = endOfWeek(new Date(), { weekStartsOn: 2 }).toISOString()

      const events = await _getEvents({ startDate, endDate, limit: 1000, region })
      if (events.docs) {
        downloadCSV(`events-${region}.csv`, convertEventsToCSV(events.docs))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div>
      <button onClick={fetchOptions} type="button">
        {region === 'pays-basque' ? 'Export events pays basque' : 'Export events landes'}
      </button>
    </div>
  )
}

export default ExportComponent
