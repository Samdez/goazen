import { getShowSpecialEvent } from '../queries/get-show-special-event'
import ExportSpecialEventButton from './ExportSpecialEventButton'

const ExportSpecialEvent = async () => {
  try {
    const { specialEvent } = await getShowSpecialEvent()
    if (typeof specialEvent === 'string' || !specialEvent.slug) return null
    return <ExportSpecialEventButton slug={specialEvent.slug} name={specialEvent.name} />
  } catch {
    return null
  }
}

export default ExportSpecialEvent
