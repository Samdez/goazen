import { getCategories } from '../queries/get-categories'
import { getLocationOptions } from '../queries/get-locations'
import FormClient from './form.client'

export default async function FormPage() {
  const locations = await getLocationOptions()
  const categories = await getCategories()
  return <FormClient locations={locations} categories={categories} />
}
