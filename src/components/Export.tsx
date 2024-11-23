import { endOfWeek, startOfWeek } from 'date-fns'
import type { Event } from '../payload-types'
import * as React from 'react'

function getDay(date: Date) {
  switch (date.getDay()) {
    case 0:
      return 'Dimanche'
    case 1:
      return 'Lundi'
    case 2:
      return 'Mardi'
    case 3:
      return 'Mercredi'
    case 4:
      return 'Jeudi'
    case 5:
      return 'Vendredi'
    case 6:
      return 'Samedi'
  }
}

export const ExportComponent: React.FC = () => {
  const convertToCSV = (objArray: Event[]) => {
    let str = ''

    for (const event of objArray) {
      const location = event.location
        ? typeof event.location === 'string'
          ? event.location
          : event.location.name
        : event.location_alt

      str += `${event.title},${getDay(new Date(event.date))},${location} - ${event.time},${event.genres},${event.price === '0' ? 'Gratuit' : `${event.price}€`}\r\n`
    }

    return str
  }

  const fetchOptions = async () => {
    try {
      const startDate = startOfWeek(new Date(), {
        weekStartsOn: 1,
      }).toISOString()
      const endDate = endOfWeek(new Date(), {
        weekStartsOn: 1,
      }).toISOString()

      const query = `where[and][0][date][greater_than_equal]=${startDate}&where[and][1][date][less_than_equal]=${endDate}&sort=date&limit=100`
      const res = await fetch(
        `https://next-events-payload-production.up.railway.app/api/events?${query}`,
      )

      if (!res.ok) throw new Error('Failed to fetch events')

      const data = await res.json()

      if (data?.docs) {
        const csvData = new Blob([convertToCSV(data.docs)], {
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
    } finally {
    }
  }

  return (
    <div>
      <button onClick={fetchOptions} type="button">
        Download this week events
      </button>
    </div>
  )
}
