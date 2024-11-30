import { GithubIcon, LinkedinIcon } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '../components/ContactForm'

function ContactPage() {
  return (
    <article className="prose max-w-none p-4">
      <h1 className="text-[#ee2244bc]">Pourquoi Goazen ?</h1>
      <p>
        « - Cest sympa le pays basque et les landes, mais c’est un peu mort, il se passe pas grand
        chose au niveau culturel… <br /> - Mais si, y’a plein de concerts et de DJ sets, mais c’est
        vrai que c’est pas évident de se tenir au courant… ». <br />
        Lassé d’avoir cette conversation, j’ai décidé de créer Goazen, afin de créer un agenda des
        concerts et soirées au Pays Basque et dans les Landes, et de centraliser l’offre culturelle
        en musiques actuelles. Si de nombreux lieux et salles de concerts oeuvrent à l’activité
        culturelle dans le sud ouest, il est souvent difficile de rester informé de cette offre,
        notamment en raison de la multiplicité des moyens de communication (sites Internet, réseaux
        sociaux, flyers, affichage…). <br />
        Afin de ne plus avoir à scroller des comptes Facebook et Instagram chaque weekend pour
        savoir où aller danser ou écouter de la musique, j’ai donc créé ce site, dont l’ambition est
        d’aider le public à trouver aisément des événements qui l’intéressent, et de permettre aux
        organisateurs de communiquer facilement. Tous les concerts de Goazen sont répertoriés un par
        un, afin de proposer une sélection éclectique mais toujours de qualité, qui met en avant les
        lieux offrant un espace d’expression aux artistes, et qui font vivre au quotidien la scène
        musicale de notre région. <br />
        Ce site s’adresse autant aux locaux, désireux d’avoir une vision d’ensemble des sorties
        culturelles tout au long de l’année, qu’aux gens de passage dans notre région, et qui
        souhaitent découvrir les lieux proposant des concerts et DJ sets, afin de ne plus jamais
        entendre dire « C’est beau le Pays Basque, mais il se passe rien » …
      </p>
      <h1 className="text-[#ee2244bc]">Qui suis-je ?</h1>
      <p>
        Musicien et développeur web, je suis toujours à l&apos;affut des concerts et bons plans au
        Pays Basque, il m&apos;est donc tout naturellement venu à l&apos;esprit ce créer Goazen,
        afin de faire partager à un maximum de personnes les évènements que je repérais.
      </p>
      <div className="flex w-full justify-evenly">
        <Link href="https://www.linkedin.com/in/samuel-de-zaldua/" target="_blank">
          <div className="group rounded-full border-2 border-black p-2 hover:bg-[#ee2244bc]">
            <LinkedinIcon className="group-hover:fill-white" />
          </div>
        </Link>
        <Link href="https://github.com/Samdez" target="_blank">
          <div className="group rounded-full border-2 border-black p-2 hover:bg-[#ee2244bc]">
            <GithubIcon className="group-hover:fill-white" />
          </div>
        </Link>
      </div>
      <div className="pt-8">
        <h1 className="text-[#ee2244bc]">
          Si vous souhaitez voir vos concerts apparaître dans Goazen, faire une suggestion ou une
          remarque, c&apos;est ici :
        </h1>
        <div className="w-full pb-8 text-center text-4xl">👇</div>
        <ContactForm />
      </div>
    </article>
  )
}

export default ContactPage
