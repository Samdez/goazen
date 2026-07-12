import { getBannerSpecialEvent } from '../queries/get-banner-special-event'
import ExportSpecialEventButton from './ExportSpecialEventButton'

const ExportSpecialEvent = async () => {
  const specialEvent = await getBannerSpecialEvent()
  if (!specialEvent?.slug) return null
  return <ExportSpecialEventButton slug={specialEvent.slug} name={specialEvent.name} />
}

export default ExportSpecialEvent
