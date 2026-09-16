import type { Metadata } from 'next'
import { LegalPage } from '@/components/privacy/LegalPage'

export const metadata: Metadata = { alternates: { canonical: '/cookies' }, title: 'Evästeet ja paikallinen tallennus', description: 'OpiOpen eväste- ja paikallisen tallennuksen käytännöt.' }

export default function CookiesPage() {
  return (
    <LegalPage title="Evästeet ja paikallinen tallennus" intro="OpiOpe pitää oletuksen yksityisenä: valinnainen analytiikka ei käynnisty ennen hyväksyntää.">
      <h2>Välttämättömät tallennukset</h2>
      <p>Kirjautuminen ja istunnon ylläpito voivat käyttää teknisesti välttämättömiä tunnisteita. Vierailijatilassa oppimisen eteneminen tallennetaan selaimen paikalliseen tallennukseen avaimella, joka on tarkoitettu vain oppimistilan säilyttämiseen.</p>

      <h2>Valinnainen analytiikka</h2>
      <p>Vercel Analytics renderöidään OpiOpessa vasta, kun käyttäjä valitsee “Hyväksy analytiikka”. Valinta tallennetaan selaimeen. Jos valitset “Vain välttämättömät”, analytiikkakomponenttia ei ladata.</p>

      <h2>Muuta valintaasi</h2>
      <p>Voit nollata OpiOpen suostumusvalinnan selaimen sivustotiedoista/localStoragesta poistamalla avaimen <code>opiope_cookie_consent_v1</code>. Tuotantoversioon voidaan lisäksi lisätä pysyvä “Evästeasetukset”-painike ennen julkaisua.</p>

      <h2>Kolmannen osapuolen palvelut</h2>
      <p>Jos myöhemmin lisätään esimerkiksi markkinointi-, video-, puhe- tai AI-palveluja, niiden mahdollinen ei-välttämätön tallennus on pidettävä pois käytöstä ennen tarvittavaa suostumusta ja tämä sivu on päivitettävä.</p>
    </LegalPage>
  )
}
