import { getCategories } from '../queries/get-categories'
import { getLocations } from '../queries/get-locations'
import FormClient from './form.client'

export default async function FormPage() {
  const locations = await getLocations({ limit: 1000 })
  const categories = await getCategories()
  return <FormClient locations={locations.docs} categories={categories} />
}
