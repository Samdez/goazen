import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ContactDialog } from '../components/ContactDialog'

const sections = [
  {
    id: 1,
    title: 'Communication',
    items: [
      'Contenu réseaux sociaux',
      'Stratégie de communication',
      'Aftermovie, interviews',
      'Visuels, affiches, flyers',
      'Création de site web',
    ],
    image: '/dj.jpg',
  },
  {
    id: 2,
    title: 'Direction artistique',
    items: [
      'Programmation musicale',
      'Conception de playlists',
      "Création d'identité sonore",
      "Création d'identité visuelle",
    ],
    image: '/festival.jpg',
  },
  {
    id: 3,
    title: 'Production évènementielle',
    items: [
      "Organisation d'évènements",
      'Activation de marque',
      'Showcase',
      'Lancement de produit',
    ],
    image: '/dj.jpg',
  },
]

export default function ProPage() {
  return (
    <>
      <h1 className="text-2xl text-center font-title mb-4">
        Goazen! <span className="text-2xl font-title text-[#E45110]">pour les professionnels</span>
      </h1>
      <ul className="text-xl text-left px-6 md:px-12 font-text mb-12 space-y-4 list-none">
        <li className="flex">
          <div className="w-2 h-2 bg-[#E45110] rounded-full mt-2 mr-3 flex-shrink-0" />
          <span className="leading-5">
            <strong>Media musical de référence</strong> au Pays Basque et dans les Landes, Goazen!
            est aussi une <strong>agence d&apos;évènementiel</strong> et de{' '}
            <strong>communication</strong> spécialisée dans le milieu musical.
          </span>
        </li>
        <li className="flex">
          <div className="w-2 h-2 bg-[#E45110] rounded-full mt-2 mr-3 flex-shrink-0" />
          <span className="leading-5">
            Nous mettons notre expertise à votre disposition pour vous aider à faire passer votre
            communication à un niveau supérieur. Que vous soyez{' '}
            <strong>organisateur d&apos;évènement</strong>, <strong>artiste</strong> ou{' '}
            <strong>festival</strong>, nous sommes là pour vous aider à faire connaitre votre
            projet.
          </span>
        </li>
        <li className="flex">
          <div className="w-2 h-2 bg-[#E45110] rounded-full mt-2 mr-3 flex-shrink-0" />
          <span className="leading-5">
            Grâce à notre{' '}
            <strong>leadership dans le milieu musical du Pays Basque et des Landes</strong>, vous
            êtes assuré de toucher un <strong>public local</strong>, passioné, et avide de nouvelles
            expériences musicales et festives.
          </span>
        </li>
      </ul>
      <div className="flex flex-col gap-12">
        {sections.map((section, index) => (
          <section key={section.id} className="relative">
            {/* Mobile Layout - Background Image with Overlay Card */}
            <div className="lg:hidden relative min-h-screen flex items-center justify-center p-6">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${section.image}')`,
                }}
              />
              <div className="absolute inset-0 bg-black/20" />

              <Card className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 flex flex-col gap-4 justify-between">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">{section.title}</h2>
                  <ul className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-[#E45110] rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-center px-8">
                  <ContactDialog />
                </CardFooter>
              </Card>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:flex items-center justify-between px-12">
              <div className="container">
                <div className={`grid grid-cols-2 gap-12 items-center lg:grid-flow-col-dense`}>
                  {/* Content Section */}
                  <div className={`space-y-8 lg:col-start-2`}>
                    <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                      {section.title}
                    </h2>
                    <ul className="space-y-6">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-3 h-3 bg-[#E45110] rounded-full mt-1.5 mr-4 flex-shrink-0" />
                          <span className="text-lg text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <ContactDialog className="bg-[#E45110] text-white h-16 w-36 rounded-lg justify-self-end px-2 gap-2 font-lg border-none hover:bg-[#FFF2DD] hover:text-[#E45110] text-lg" />
                    {/* <Button
                      //  className="bg-[#E45110] hover:bg-secondary hover:text-black hover:scale-110 w-1/2"
                      className="bg-[#E45110] text-white h-16 w-36 rounded-lg justify-self-end px-2 gap-2 font-lg border-none hover:bg-[#FFF2DD] hover:text-[#E45110] text-lg"
                    >
                      Discutons-en!
                    </Button> */}
                  </div>

                  {/* Image Section */}
                  <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <div className="aspect-[4/3] relative overflow-hidden rounded-2xl shadow-2xl">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={index === 0}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="bg-white flex flex-col items-center mt-12 py-4 gap-4">
        <p className="text-xl font-title text-center">Ils nous ont fait confiance:</p>
        <ul className="text-md font-text flex gap-8 flex-wrap justify-center">
          <Image
            src="/cropped-casa-lola-1-blanc.png"
            alt="Casa Lola"
            width={130}
            height={130}
            className="[filter:brightness(0)_saturate(100%)] object-contain"
            unoptimized
          />
          <Image
            src="/astra.jpg"
            alt="Astra"
            width={130}
            height={130}
            className="object-contain"
            unoptimized
          />
          <Image
            src="/sunsets.png"
            alt="Sunsets"
            width={130}
            height={130}
            className="object-contain"
            unoptimized
          />
          <Image
            src="/BHM.png"
            alt="BHM"
            width={130}
            height={130}
            className="object-contain"
            unoptimized
          />
          <Image
            src="/nous.png"
            alt="Nous"
            width={130}
            height={130}
            className="object-contain"
            unoptimized
          />
          <Image
            src="/resonance.png"
            alt="Resonance"
            width={130}
            height={130}
            className="object-contain"
            unoptimized
          />
          <Image
            src="/banana.png"
            alt="Banana"
            width={130}
            height={130}
            className="[filter:brightness(0)_saturate(100%)] object-contain"
            unoptimized
          />
        </ul>
      </div>
    </>
  )
}
