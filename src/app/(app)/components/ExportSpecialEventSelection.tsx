import { getBannerSpecialEvent } from '../queries/get-banner-special-event'
import ExportSpecialEventButton from './ExportSpecialEventButton'

const ExportSpecialEventSelection = async () => {
  const specialEvent = await getBannerSpecialEvent()
  if (!specialEvent?.slug) return null
  return (
    <ExportSpecialEventButton slug={specialEvent.slug} name={specialEvent.name} selectionOnly />
  )
}

export default ExportSpecialEventSelection
