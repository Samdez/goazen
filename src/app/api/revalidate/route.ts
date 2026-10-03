import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Accepte plusieurs tags (`?tag=a&tag=b`) : un enregistrement d'événement en
// révalide trois ou quatre d'un coup, en une seule requête.
export async function POST(request: NextRequest) {
  const tags = request.nextUrl.searchParams.getAll('tag').filter(Boolean)

  if (!tags.length) {
    return NextResponse.json({ message: 'Missing tag parameter' }, { status: 400 })
  }

  try {
    tags.forEach((tag) => revalidateTag(tag))
    return NextResponse.json({ revalidated: true, tags, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
