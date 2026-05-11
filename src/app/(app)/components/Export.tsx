'use client'
import { endOfWeek, startOfWeek } from 'date-fns'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'
import { convertEventsToCSV } from './export-csv'

const ExportComponent = ({ region }: { region: 'pays-basque' | 'landes' }) => {
  const fetchOptions = async () => {
    try {
      const startDate = startOfWeek(new Date(), {
        weekStartsOn: 2,
      }).toISOString()
      const endDate = endOfWeek(new Date(), {
        weekStartsOn: 2,
      }).toISOString()

      const events = await _getEvents({
        startDate,
        endDate,
        limit: 1000,
        region,
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
        {region === 'pays-basque' ? 'Export events pays basque' : 'Export events landes'}
      </button>
    </div>
  )
}

export default ExportComponent
