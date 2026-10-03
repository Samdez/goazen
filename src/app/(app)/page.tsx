import { HomeView } from './home-view'

// Home sans filtre : en cache, sans durée de vie. Régénérée quand un événement
// publié change et chaque nuit par le cron quotidien (tag `events`), pour
// passer au jour suivant (« Ce soir », bannière bon plan…).
//
// Dès qu'un filtre est présent dans l'URL (`when`, `region`, `city`,
// `genres`), next.config.ts réécrit la requête vers ./home-filtree, rendue à
// la demande. L'URL vue par le visiteur reste `/?…`.
export const revalidate = false

export const metadata = {
  alternates: {
    canonical: 'https://goazen.info',
  },
}

export default function Page() {
  return <HomeView searchParams={{}} />
}
