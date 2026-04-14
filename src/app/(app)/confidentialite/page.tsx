export const metadata = {
  title: 'Politique de confidentialité — Goazen!',
}

export default function ConfidentialitePage() {
  return (
    <div className="prose prose-sm mx-auto max-w-[72ch] px-4 py-12">
      <h1>Politique de confidentialité</h1>
      <p>
        <em>Dernière mise à jour : avril 2025</em>
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données personnelles collectées via le site Goazen!
        (goazen.info) est l&apos;équipe Goazen!, joignable à l&apos;adresse{' '}
        <a href="mailto:contact@goazen.info">contact@goazen.info</a>.
      </p>

      <h2>2. Données collectées</h2>
      <p>
        Lors de la soumission d&apos;un événement via notre formulaire, nous collectons les données
        suivantes :
      </p>
      <ul>
        <li>
          <strong>Adresse email</strong> — obligatoire, utilisée pour vous contacter en lien avec
          votre soumission et pour vous envoyer des communications de partenaires culturels.
        </li>
        <li>
          <strong>Informations sur l&apos;événement</strong> (titre, date, lieu, genres, etc.) —
          publiées sur le site après validation par notre équipe.
        </li>
        <li>
          <strong>Image</strong> (optionnelle) — publiée en lien avec l&apos;événement.
        </li>
      </ul>
      <p>Nous ne collectons pas de données de navigation, de cookies de traçage ou de profils.</p>

      <h2>3. Base légale du traitement</h2>
      <p>
        Le traitement de votre email repose sur l&apos;
        <strong>exécution d&apos;un contrat</strong> (Art. 6(1)(b) du RGPD). Goazen! est un
        service gratuit dont le modèle économique repose sur le partage des emails des organisateurs
        avec des partenaires commerciaux. En acceptant les{' '}
        <a href="/cgu">CGU</a> lors de la soumission d&apos;un événement, vous acceptez
        expressément ce fonctionnement, qui constitue la contrepartie directe de la gratuité du
        service.
      </p>

      <h2>4. Finalités du traitement</h2>
      <ul>
        <li>Publication et gestion de votre événement sur goazen.info</li>
        <li>
          Transmission à des partenaires commerciaux de Goazen! (billetteries, prestataires
          événementiels, acteurs de la filière musicale) à des fins de prospection commerciale liée
          à l&apos;organisation d&apos;événements
        </li>
      </ul>

      <h2>5. Destinataires des données</h2>
      <p>
        Votre adresse email est susceptible d&apos;être transmise à des partenaires commerciaux de
        Goazen! dans le cadre de son modèle économique. Ces partenaires s&apos;engagent à
        l&apos;utiliser uniquement à des fins liées à l&apos;organisation et la promotion
        d&apos;événements. Goazen! sélectionne ses partenaires et ne cède pas les données à des
        acteurs sans lien avec la filière événementielle.
      </p>

      <h2>6. Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre email est présent dans notre base. Vous pouvez
        demander leur suppression à tout moment (voir article 7).
      </p>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Droit d&apos;accès</strong> — obtenir une copie des données vous concernant
        </li>
        <li>
          <strong>Droit de rectification</strong> — faire corriger des données inexactes
        </li>
        <li>
          <strong>Droit à l&apos;effacement</strong> — demander la suppression de vos données
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> — vous opposer à l&apos;utilisation de vos
          données
        </li>
      </ul>
      <p>
        Pour exercer l&apos;un de ces droits, envoyez un email à{' '}
        <a href="mailto:contact@goazen.info">contact@goazen.info</a> en précisant votre adresse
        email et votre demande. Nous traiterons votre demande dans les meilleurs délais.
      </p>
      <p>
        La suppression de vos données est effectuée manuellement dans notre système. Il n&apos;existe
        pas de portail de désinscription automatisé.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Les données sont stockées dans une base MongoDB hébergée sur une infrastructure sécurisée.
        L&apos;accès à la base de données est restreint aux administrateurs de Goazen!.
      </p>

      <h2>9. Réclamation</h2>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
        auprès de la{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          CNIL
        </a>{' '}
        (Commission Nationale de l&apos;Informatique et des Libertés).
      </p>

      <h2>10. Contact</h2>
      <p>
        <a href="mailto:contact@goazen.info">contact@goazen.info</a>
      </p>
    </div>
  )
}
