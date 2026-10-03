// Fire-and-forget cache busting from Payload hooks. Goes through the
// /api/revalidate HTTP contract so it also works when hooks run outside the
// Next request context (pnpm payload run).
export async function revalidateCacheTags(tags: string[]) {
  if (!tags.length) return
  const query = tags.map((tag) => `tag=${encodeURIComponent(tag)}`).join('&')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate?${query}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.REVALIDATE_SECRET ?? ''}` },
    })
    if (!response.ok) {
      console.error(`Revalidating tags ${tags.join(', ')} failed: HTTP ${response.status}`)
    }
  } catch (err) {
    console.error(`Error revalidating tags ${tags.join(', ')}:`, err)
  }
}

export async function revalidateCacheTag(tag: string) {
  return revalidateCacheTags([tag])
}
