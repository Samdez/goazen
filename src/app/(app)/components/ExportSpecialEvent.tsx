import { getShowSpecialEvent } from '../queries/get-show-special-event'
import ExportSpecialEventButton from './ExportSpecialEventButton'

const ExportSpecialEvent = async () => {
  const specialEvent = await getShowSpecialEvent()
  if (!specialEvent?.slug) return null
  return <ExportSpecialEventButton slug={specialEvent.slug} name={specialEvent.name} />
}

export default ExportSpecialEvent
