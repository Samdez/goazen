// Fire-and-forget cache busting from Payload hooks. Uses the same
// /api/revalidate HTTP contract as the Events slug hook so it also works
// when hooks run outside the Next request context (pnpm payload run).
export async function revalidateCacheTag(tag: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
      method: 'POST',
    })
  } catch (err) {
    console.error(`Error revalidating tag "${tag}":`, err)
  }
}
