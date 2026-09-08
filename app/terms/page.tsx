import type { Metadata } from 'next'
import { LegalPage } from '@/components/privacy/LegalPage'

export const metadata: Metadata = { title: 'Käyttöehdot', description: 'OpiOpen käyttöehdot.' }

export default function TermsPage() {
  return (
    <LegalPage title="Käyttöehdot" intro="Nämä ehdot muodostavat OpiOpen tuotantoon vietävän käyttöehtopohjan. Yrityksen viralliset tiedot ja mahdolliset maksuehdot on viimeisteltävä ennen julkaisua.">
      <h2>1. Palvelu</h2>
      <p>OpiOpe on suomen kielen oppimisalusta. Sisältö on tarkoitettu opiskeluun ja harjoitteluun. OpiOpe ei myönnä virallista CEFR- tai YKI-todistusta eikä takaa YKI-kokeen läpäisyä.</p>
      <h2>2. Käyttäjätili</h2>
      <p>Käyttäjä vastaa antamiensa tietojen oikeellisuudesta ja tunnustensa suojaamisesta. Vierailijatilassa paikallisesti tallennettu data voi kadota, jos selaimen sivustotiedot poistetaan.</p>
      <h2>3. AI, käännös ja puhepalvelut</h2>
      <p>Automatisoitu palaute voi sisältää virheitä eikä se korvaa virallista kieliarviointia. Palvelu ei saa näyttää AI-, käännös- tai puhearviointituloksia, jos niitä tuottavaa oikeaa palvelua ei ole määritetty.</p>
      <h2>4. Immateriaalioikeudet</h2>
      <p>OpiOpen oma käyttöliittymä ja oma oppimateriaali ovat oikeudenhaltijansa suojattua aineistoa. Ulkopuolisiin lähteisiin linkitetään niiden omilla ehdoilla eikä sisältöä kopioida ilman asianmukaista oikeutta.</p>
      <h2>5. Saatavuus</h2>
      <p>Palvelua kehitetään jatkuvasti, eikä keskeytyksetöntä saatavuutta voida luvata. Virhetilanteissa käyttöliittymän tulee kertoa, jos toiminto ei ole käytettävissä.</p>
      <h2>6. Maksulliset ominaisuudet</h2>
      <p>Maksuehtoja ei saa aktivoida tai esittää valmiina ennen kuin maksupalvelu, hinnat, peruutus- ja kuluttajansuojaehdot sekä yrityksen viralliset tiedot on määritetty.</p>
    </LegalPage>
  )
}
