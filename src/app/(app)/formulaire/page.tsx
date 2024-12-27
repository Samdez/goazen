import FormClient from './form.client'
import { getCategories } from '../api/queries/payload/get-categories'
import { getLocations } from '../api/queries/payload/get-locations'

export default async function FormPage() {
  const locations = await getLocations({ limit: 1000 })
  const categories = await getCategories()
  return <FormClient locations={locations.docs} categories={categories} />
}
