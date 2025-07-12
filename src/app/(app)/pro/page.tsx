import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProPage() {
  return (
    <div className="flex justify-center">
      <Tabs
        defaultValue="organisateur"
        className="w-full px-12 md:px-32 flex flex-col items-center gap-4"
      >
        <TabsList>
          <TabsTrigger value="organisateur">Organisateur</TabsTrigger>
          <TabsTrigger value="artiste">Artiste</TabsTrigger>
          <TabsTrigger value="festival">Festival</TabsTrigger>
        </TabsList>
        <TabsContent value="organisateur">
          <Organisateur />
        </TabsContent>
        <TabsContent value="artiste">
          <Artiste />
        </TabsContent>
        <TabsContent value="festival">
          <Festival />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Organisateur() {
  return (
    <>
      <div className="flex gap-4 w-full justify-center mb-4">
        <Card className="cursor-default w-full">
          <CardHeader>
            <CardTitle>🆓 Notre offre gratuite</CardTitle>
            <CardDescription>
              Goazen! vous offre la possibilité de communiquer gratuitement sur tous vos events
              musicaux
            </CardDescription>
            <ul className="list-disc list-inside text-md font-text">
              <li>Présence sur le site référence des concerts au Pays Basque et dans les Landes</li>
              <li>Plus de 4000 visiteurs uniques par mois</li>
              <li>La possibilité de partager facilement vos évènements via notre formulaire</li>
              <li>
                Une chance de figurer chaque semaine dans l&apos;agenda Instagram (8000+ abonnés)
              </li>
              <li>Une page dédiée sur le site pour votre lieu</li>
            </ul>
          </CardHeader>
        </Card>
      </div>
      <p className="text-md font-title mb-4">
        Pour que vos évènements rencontrent le succès qu&apos;ils méritent, Goazen! vous propose des
        offres sur mesure:{' '}
      </p>
      <div className="flex flex-col md:flex-row gap-8 md:gap-4 w-full">
        {offers.organisateur.map((offer) => (
          <Card
            className={`flex flex-col justify-between cursor-default ${offer.isPremium ? 'border-[#E45110] border-2' : ''}`}
            key={offer.name}
          >
            <CardHeader>
              <CardTitle>{offer.name}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
              <ul className="list-disc list-inside text-md font-text">
                {offer.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button className="bg-[#E45110] hover:bg-secondary hover:text-black hover:scale-110">
                Discutons-en!
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-md font-title my-4">
        Vous souhaitez faire passer votre communication à un niveau supérieur? Goazen! vous propose
        un accompagnement personnalisé, selon vos besoins:
      </p>
      <div className="flex gap-4 w-full justify-center">
        <Card className="cursor-default">
          <CardHeader>
            <CardTitle>💎 Communication clé en main</CardTitle>
            <CardDescription>Sur devis</CardDescription>
            <ul className="list-disc list-inside text-md font-text">
              <li>Gestion complète (site, réseaux, visuels, vidéos)</li>
              <li>Création site web dédié</li>
              <li>Stratégie marketing personnalisée</li>
            </ul>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button className="bg-[#E45110] hover:bg-secondary hover:text-black hover:scale-110">
              Discutons-en!
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

function Artiste() {
  return (
    <>
      <div className="flex gap-4 w-full justify-center mb-4">
        <Card className="cursor-default w-full">
          <CardHeader>
            <CardTitle>🆓 Notre offre gratuite</CardTitle>
            <CardDescription>
              Goazen! vous offre la possibilité de communiquer gratuitement sur tous vos events
              musicaux
            </CardDescription>
            <ul className="list-disc list-inside text-md font-text">
              <li>Présence sur le site référence des concerts au Pays Basque et dans les Landes</li>
              <li>Plus de 4000 visiteurs uniques par mois</li>
              <li>La possibilité de partager facilement vos évènements via notre formulaire</li>
              <li>
                Une chance de figurer chaque semaine dans l&apos;agenda Instagram (8000+ abonnés)
              </li>
              <li>Une page dédiée sur le site pour votre projet musical</li>
            </ul>
          </CardHeader>
        </Card>
      </div>
      <p className="text-md font-title mb-4">
        Pour que vos évènements rencontrent le succès qu&apos;ils méritent, Goazen! vous propose des
        offres sur mesure:{' '}
      </p>
      <div className="flex flex-col md:flex-row gap-8 md:gap-4 w-full">
        {offers.artiste.map((offer) => (
          <Card
            className={`flex flex-col justify-between cursor-default ${offer.isPremium ? 'border-[#E45110] border-2' : ''}`}
            key={offer.name}
          >
            <CardHeader>
              <CardTitle>{offer.name}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
              <ul className="list-disc list-inside text-md font-text">
                {offer.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button className="bg-[#E45110] hover:bg-secondary hover:text-black hover:scale-110">
                Discutons-en!
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

function Festival() {
  return (
    <>
      <div className="flex gap-4 w-full justify-center mb-4">
        <Card className="cursor-default w-full">
          <CardHeader>
            <CardTitle>🆓 Notre offre gratuite</CardTitle>
            <CardDescription>
              Goazen! vous offre la possibilité de communiquer gratuitement sur votre festival
            </CardDescription>
            <ul className="list-disc list-inside text-md font-text">
              <li>Présence sur le site référence des concerts au Pays Basque et dans les Landes</li>
              <li>Plus de 4000 visiteurs uniques par mois</li>
              <li>La possibilité de partager facilement votre festival via notre formulaire</li>
              <li>
                Une chance de figurer chaque semaine dans l&apos;agenda Instagram (8000+ abonnés)
              </li>
              <li>Une page dédiée sur le site pour votre festival</li>
            </ul>
          </CardHeader>
        </Card>
      </div>
      <p className="text-md font-title mb-4">
        Pour que votre festival rencontre le succès qu&apos;il mérite, Goazen! vous propose des
        offres sur mesure:
      </p>
      <div className="flex flex-col md:flex-row gap-8 md:gap-4 w-full">
        {offers.festival.map((offer) => (
          <Card
            className={`flex flex-col justify-between cursor-default ${offer.isPremium ? 'border-[#E45110] border-2' : ''}`}
            key={offer.name}
          >
            <CardHeader>
              <CardTitle>{offer.name}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
              <ul className="list-disc list-inside text-md font-text">
                {offer.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button className="bg-[#E45110] hover:bg-secondary hover:text-black hover:scale-110">
                Discutons-en!
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

const offers = {
  organisateur: [
    {
      name: '⚙️ PRO - Occasionnel',
      description: 'Pour des besoins ponctuels',
      features: ['Reel : 300€', 'Live report : 500€'],
    },
    {
      name: '🌟 PREMIUM - Le plus populaire',
      description: '79€/mois - SANS ENGAGEMENT',
      features: [
        'Accès CMS complet (gestion autonome)',
        'Envoi des events par mail/whatsapp',
        'Gestion des évènements récurrents',
        'Reels à 200€ (au lieu de 300€)',
        'Live reports à 350€ (au lieu de 500€)',
        'Contact privilégié & suivi personnalisé',
        'Support par WhatsApp/mail',
      ],
      isPremium: true,
    },
    {
      name: '🤝 PARTENAIRE - Places limitées',
      description: '79€/mois - Engagement 12 mois',
      features: [
        'Tout PRO+ inclus',
        '1er reel OFFERT (valeur 300€)',
        "Position assurée dans l'agenda Instagram",
        'TOP POSITION site & agenda',
        'Statut partenaire officiel',
      ],
    },
  ],
  artiste: [
    {
      name: '🚀 PRO - À la carte',
      description: 'Pour des besoins ponctuels',
      features: ['Reel portrait artiste : 200€', 'Live report : 350€'],
    },
    {
      name: '🌟 PARTENAIRE - Places limitées',
      description: '39€/mois - Engagement 12 mois',
      features: [
        '1er reel OFFERT (valeur 200€)',
        'Partage sur Instagram Goazen!',
        'Position assurée dans l&apos;agenda Instagram',
        '-30% sur tous les réels suivants',
        'Top position sur les pages artistes',
      ],
      isPremium: true,
    },
  ],
  festival: [
    {
      name: '⚡ PRO - Couverture standard',
      features: ['Reel pre-festival: 300€', 'Mini Live report : 250€', 'Full Live report : 500€'],
    },
    {
      name: '💼 PARTENAIRE - Places limitées',
      description: 'Reel présentation OFFERT (en amont)',
      features: [
        'Reel pre-festival: 200€',
        'Mini Live report : 200€ (-20%)',
        'Full Live report : 400€ (-20%)',
        'Mise en avant spéciale (bannière, site & agenda)',
        '-30% sur prestations suivantes',
        'Création de jeu concours',
      ],
      isPremium: true,
    },
  ],
}
