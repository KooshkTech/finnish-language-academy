# OpiOpe V24.23.1 — alkuperäinen ulkoasu ja kielikorjaus

## Julkaisuvalmius

Sopii paikalliseen kokeiluun. Ei vielä valmis julkiseen tuotantokäyttöön.
Todellisilla opettaja- ja opiskelijatileillä tehtävää testausta ei ole suoritettu.
Oppituntien suomen kieli ja taitotasot tarvitsevat opettajan tarkistuksen.

## Tässä korjauksessa

- V24.22.1:n alkuperäinen etusivu, opiskelusivu, pääasettelu ja yleinen
  tyylitiedosto palautettiin. Tyylitiedoston identtisyys varmistetaan testissä.
- Kaikki 70 uutta suomen oppituntia säilyvät: 10 jokaiselle tasolle A0–C2.
- Englanninkieliset selitykset ja sanaston määritelmät korvattiin suomella.
  Englanninkielinen lukutuki poistettiin uusista oppitunneista.
- Kielioppiharjoituksiin lisättiin itse kirjoitettavat täydennysvastaukset.
  Puheharjoituksissa on tuettu vaihtoehto ja lisähaaste.
- Ruotsin kurssien evästeilmoitus on ruotsiksi. Suomenkielinen älyapu
  ei avaudu ruotsin kurssien päälle.
- Vanhoilla moduulisivuilla on selkeä linkki uuteen 10 oppitunnin polkuun.
- Opettajan luonnosesikatseluun lisättiin ladattava opiskelijan
  tehtävämoniste, erillinen opettajan vastausavain ja koko luonnoksen
  JSON-vienti. Moniste ja vastausavain ovat tekstitiedostoja, eivät PDF-tiedostoja.
- Opettajan julkaisun oletuskohteena on oma luokka, ei julkinen julkaisu.

Opiskelijan vienti koostetaan sallituista kentistä: vastauksia, niiden selityksiä
ja opettajan muistiinpanoja ei sisällytetä. Opettajan vastausavain ja koko
JSON-luonnos sisältävät vastaukset, eikä niitä pidä jakaa opiskelijoille.

## Oikeat oppituntisivut

Uusi A0-polku: `/learn/academy/fi-a0`.
Muut tasot: `/learn/academy/fi-a1`, `/fi-a2`, `/fi-b1`, `/fi-b2`, `/fi-c1`
ja `/fi-c2` saman `/learn/academy`-polun alla.

`/learn/academy/opiope-1` on aiempi moduuli. Sen julkaisemattomat otsikot
ovat edelleen suunnitelmia, eivät uusia puuttuvia oppitunteja.

## Opettajan materiaalista oppitunniksi

Nykyinen sisältöstudio sijaitsee osoitteessa `/teacher/content-studio`.
Se vaatii määritetyn palvelimen ja opettajan käyttöoikeuden. Teksti voidaan
lähettää luonnostimeen, ja PDF, kuva tai ääni vaatii määritetyn tunnistuspalvelun.
AI-luonnostin vaatii palvelinavaimen ja malliasetuksen ja voi aiheuttaa kustannuksia.
Tässä työssä ei tehty maksullisia AI-kutsuja eikä muutettu tuotantotietokantaa.

Nykyinen työnkulku on:

1. Opettaja vahvistaa aineiston käyttöoikeudet ja lähettää yhden kappaleen.
2. Palvelu poimii tekstin ja muodostaa tarkistusta vaativan luonnoksen.
3. Opettaja tarkistaa sisällön ja voi ladata monisteen sekä vastausavaimen.
4. Opettaja valitsee luokan ja julkaisee tai ajastaa hyväksytyn luonnoksen.

Tämä työnkulku on olemassa koodissa mutta sitä ei ole varmennettu todellisilla
tileillä tässä ympäristössä. Kokonaisen kirjan luotettava käsittely ei ole valmis:
kappalejako, taustajono, käsittelytilan seuranta ja virheiden uudelleenyritykset
puuttuvat. Yksi nykyinen pyyntö käsittelee enintään 24 000 tekstimerkkiä.
Älä oleta, että koko kirja käsitellään automaattisesti yhdellä latauksella.

## Pedagoginen suunta

Finn Lecturan oppikirjailijoiden kuvaamasta lähestymistavasta käytetään
yleisiä ideoita: selkeä eteneminen, arjen viestintä, ymmärrettävä kieliopin
esitys ja eriytetty harjoittelu. Oppikirjan tekstiä, tehtäviä tai äänitteitä
ei kopioida. Lähde: https://finnlectura.fi/ajankohtaista/2025/nain-syntyy-uudistettu-suomen-mestari/

Koneääni ei ole luonnollisesti äänitetty puhe. Valmis-merkinnät ja
kirjoitusluonnokset eivät vielä tallennu oppijan tilille. Taitotasot ovat
opetuksen tavoitteita, eivät virallisia arvioita.

## Käyttöönotto ja testaus

Pura ZIP uuteen kansioon. Käytä Node.js 24:ää. Säilytä omat salaiset asetukset
turvallisesti; niitä ei ole paketissa.

```bash
npm ci
npm run verify:release
npm run dev
```

Avaa selaimessa `http://localhost:3000`. Pidä paikallinen palvelin käynnissä.
Tuotantorakennuksen jälkeen voi ajaa `node scripts/smoke-finnish-curriculum.mjs`.
Paketti ei julkaise sivustoa eikä yhdistä GitHubin muutospyyntöä.

Ennen julkista julkaisua varmista oikea ympäristökonfiguraatio, nykyiset
tietokantamigraatiot, käyttöoikeuksien eristys eri opettajien ja luokkien välillä,
opiskelijan pääsy vain jaettuun sisältöön, opettajan materiaalikäsittely sekä
henkilötietojen käsittelyä koskevat tiedot. Suomenkielisen täydellisen
tietosuojatekstin ruotsinkielinen versio on edelleen viimeisteltävä.

## Tämän paketin tarkistukset

`npm run verify:release` onnistui: lint, typecheck, test, build sekä kaikki
julkaisuauditoinnit, mukaan lukien class-sessions ja community. Kaikki 16
regressiotestiä läpäistiin. HTTP-savukoe tarkisti 96 reittiä, mukaan lukien
kaikki 70 uutta oppituntia, sekä kaksi virheellisen tunnisteen 404-vastausta.
Nämä eivät korvaa oikeilla opettaja- ja opiskelijatileillä tehtävää testausta.
