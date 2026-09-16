import type { Metadata } from 'next'
import { LegalPage } from '@/components/privacy/LegalPage'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Tietosuojaseloste',
  description: 'OpiOpen tietosuojaseloste: mitä tietoja käsitellään, miksi niitä käsitellään ja mitä oikeuksia käyttäjällä on.',
}

const controller = process.env.NEXT_PUBLIC_CONTROLLER_NAME ?? 'MÄÄRITÄ REKISTERINPITÄJÄ ENNEN JULKAISUA'
const email = process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'MÄÄRITÄ TIETOSUOJAN YHTEYSSÄHKÖPOSTI'

export default function PrivacyPage() {
  return (
    <LegalPage title="Tietosuojaseloste" intro="OpiOpe on suunniteltu tietojen minimoinnin periaatteella. Tämä seloste kuvaa OpiOpen henkilötietojen käsittelyn tuotantoversion vaatimukset.">
      <h2>1. Rekisterinpitäjä</h2>
      <p><strong>{controller}</strong><br />Tietosuoja-asiat: {email}</p>
      <p className="legal-warning">Tuotantoon ei saa julkaista tätä sivua ennen kuin rekisterinpitäjän virallinen nimi ja yhteystiedot on määritetty.</p>

      <h2>2. Mitä tietoja käsittelemme</h2>
      <ul>
        <li>tilitiedot, kuten sähköpostiosoite ja käyttäjätunniste</li>
        <li>oppimisprofiili: arvioitu taso, tavoite ja päivittäinen opiskelutavoite</li>
        <li>oppimisen eteneminen, harjoitusyritykset ja sanaston kertausdata</li>
        <li>tekniset ja turvallisuuteen liittyvät tiedot, joita palveluntarjoajat tarvitsevat palvelun toimittamiseen</li>
        <li>analytiikkatiedot vain, jos käyttäjä antaa siihen suostumuksen</li>
      </ul>
      <p>Vierailijatilassa oppimistietoja voidaan säilyttää vain käyttäjän omassa selaimessa. OpiOpe ei saa niitä palvelimelle ennen kuin ne erikseen siirretään tilille.</p>

      <h2>3. Käsittelyn tarkoitukset ja oikeusperusteet</h2>
      <ul>
        <li><strong>Palvelun toimittaminen ja tilin ylläpito:</strong> sopimuksen täytäntöönpano tai käyttäjän pyytämät toimet ennen sopimusta.</li>
        <li><strong>Oppimisen etenemisen tallentaminen:</strong> palvelun toimittaminen käyttäjän pyynnöstä.</li>
        <li><strong>Tietoturva ja väärinkäytösten torjunta:</strong> oikeutettu etu, kun sitä sovelletaan ja tasapainotetaan käyttäjän oikeuksiin nähden.</li>
        <li><strong>Valinnainen analytiikka:</strong> suostumus. Suostumuksen voi peruuttaa.</li>
      </ul>

      <h2>4. Säilytysajat</h2>
      <p>Henkilötietoja säilytetään vain niin kauan kuin niitä tarvitaan käyttötarkoitukseen tai lakisääteiseen velvoitteeseen. Tilin poistopyyntö käynnistää käyttäjän oppimisdatan ja tilin poistamisen, ellei jotakin tietoa ole säilytettävä lakisääteisesti. Tarkat tuotantokohtaiset säilytysajat on dokumentoitava ennen julkaisua.</p>

      <h2>5. Palveluntarjoajat ja siirrot</h2>
      <p>OpiOpe voi käyttää esimerkiksi Supabasea tietokantaan ja tunnistautumiseen sekä Verceliä sovelluksen toimittamiseen ja käyttäjän suostumuksella analytiikkaan. Tuotannossa käytettävät alikäsittelijät, niiden sijainnit, sopimukset ja mahdolliset ETA-alueen ulkopuoliset siirrot on dokumentoitava ennen julkaisua.</p>

      <h2>6. Oikeutesi</h2>
      <p>Sinulla voi tilanteesta riippuen olla oikeus saada tietoa käsittelystä, tarkastaa tietosi, korjata tietoja, pyytää poistamista tai käsittelyn rajoittamista, vastustaa käsittelyä, saada tietosi siirrettävässä muodossa sekä peruuttaa suostumus. Voit myös tehdä valituksen toimivaltaiselle tietosuojaviranomaiselle.</p>

      <h2>7. Automatisointi ja AI</h2>
      <p>Oppimissuositukset voivat perustua harjoitushistoriaan, mutta niitä ei käytetä päätöksiin, joilla olisi käyttäjälle oikeudellisia tai vastaavan merkittäviä vaikutuksia. AI-palvelua ei käynnistetä ennen kuin turvallinen palvelinpuolen integraatio, tietosuojavaikutukset ja palveluntarjoajan ehdot on tarkistettu.</p>

      <h2>8. Tietoturva</h2>
      <p>Tilikohtaiset oppimistiedot suojataan Supabasen Row Level Security -säännöillä. Palveluroolin avaimia tai muita salaisuuksia ei sijoiteta selaimeen. Käyttäjän omia tietoja koskevat vienti- ja poistotoiminnot edellyttävät voimassa olevaa kirjautumista.</p>
    </LegalPage>
  )
}
