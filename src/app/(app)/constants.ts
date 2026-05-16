export const REGIONS = ['pays-basque', 'landes']

/**
 * Curated city quick-picks for the FilterBar. Cascades from region selection.
 * The Landes list is deliberately the coastal festival towns — not the
 * administrative centres (Dax, Mont-de-Marsan). See CONTEXT.md.
 */
export const CITY_CHIPS: Record<'pays-basque' | 'landes', Array<{ slug: string; label: string }>> = {
  'pays-basque': [
    { slug: 'biarritz', label: 'Biarritz' },
    { slug: 'bayonne', label: 'Bayonne' },
    { slug: 'anglet', label: 'Anglet' },
  ],
  landes: [
    { slug: 'hossegor', label: 'Hossegor' },
    { slug: 'capbreton', label: 'Capbreton' },
    { slug: 'seignosse', label: 'Seignosse' },
  ],
}

export const AUTRE_CATEGORY_NAME = 'Autre'
