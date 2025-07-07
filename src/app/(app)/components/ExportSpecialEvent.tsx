'use client'
import { endOfWeek, startOfWeek } from 'date-fns'
import type { Event } from '../../../payload-types'
import * as React from 'react'
import { _getEvents } from '../queries/get-events'

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

const ExportSpecialEvent = () => {
  const convertToCSV = (objArray: Event[]) => {
    let str = ''

    for (const event of objArray) {
      const location = event.location
        ? typeof event.location === 'string'
          ? event.location
          : event.location.name
        : event.location_alt
      const locationCity =
        typeof event.location !== 'string' &&
        event.location?.['city V2'] &&
        typeof event.location?.['city V2'] === 'object'
          ? event.location?.['city V2'].name
          : ''

      const categories = event.category
        ?.map((cat) => typeof cat !== 'string' && cat.name)
        .join(' / ')

      str += `${event.title},${getDay(new Date(event.date))},${location} / ${locationCity} - ${
        event.time
      },${event.genres || categories},${event.price === '0' ? 'Gratuit' : `${event.price}€`}\r\n`
    }

    return str
  }

  const fetchOptions = async () => {
    try {
      const events = await _getEvents({
        limit: 1000,
        specialEvent: 'fetes-de-bayonne',
      })
      if (events.docs) {
        const csvData = new Blob([convertToCSV(events.docs)], {
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
        Tous les concerts des Fêtes de Bayonne
      </button>
    </div>
  )
}

export default ExportSpecialEvent
