import { useParams } from 'next/navigation'

export function useCategory() {
  const params = useParams()
  return typeof params.genre === 'string' ? params.genre : params.genre?.[0]
}
