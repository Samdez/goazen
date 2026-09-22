import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

// L'image ne dépend d'aucune donnée : une fois générée, elle peut être servie
// telle quelle longtemps.
export const revalidate = 604800

const SIZE = { width: 1200, height: 630 }

/**
 * La vignette de partage générique du site, à une URL stable.
 *
 * Aucune page liste n'avait d'`og:image` : seules les pages événement en
 * avaient une, via leur visuel. Partagée sur WhatsApp ou Slack, la home
 * n'affichait aucune vignette.
 *
 * Pourquoi une route et pas le fichier `opengraph-image.tsx` : Next ne
 * l'injecte que dans les pages qui ne déclarent pas leur propre `openGraph`.
 * Les pages région, ville et listes en déclarent un (titre, description, url),
 * ce qui suffisait à faire disparaître l'image — vérifié, `og:image` absent.
 * Une URL stable peut être référencée explicitement partout.
 *
 * Générée plutôt que déposée en binaire : le visuel suit les couleurs de
 * marque, et il n'y a pas d'asset 1200×630 à maintenir à la main.
 */
export async function GET() {
  const mascot = await readFile(join(process.cwd(), 'public', 'GOAZEN_MASCOTTES.png'))
  const mascotSrc = `data:image/png;base64,${mascot.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          padding: '0 80px',
          background: '#faedd2',
          border: '16px solid #000000',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascotSrc} alt="" height={380} style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 108, fontWeight: 800, color: '#ea5c1f', lineHeight: 1 }}>
            GOAZEN!
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, color: '#000000', marginTop: 24 }}>
            Concerts, DJ sets et soirées
          </div>
          <div style={{ fontSize: 40, color: '#000000', marginTop: 8 }}>
            Pays Basque &amp; Landes
          </div>
        </div>
      </div>
    ),
    SIZE,
  )
}
