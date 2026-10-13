# GARAJ Recepten – nieuwe website

## Eenmalig: de nieuwe site online zetten

1. Open je repository op **github.com** (de repository waar garaj.nl nu uit komt).
2. Kies **Add file → Upload files**.
3. Sleep **de inhoud van deze map** naar het uploadvak: alle bestanden plus de mappen
   `recept`, `beheer` en `tools`. Sleep niet de map zelf.
4. Klik onderaan op **Commit changes**.
5. Na een paar minuten staat de nieuwe site live op https://garaj.nl.

Je hoeft vooraf niets te verwijderen. Bestanden met dezelfde naam worden vervangen,
en alle oude bestanden (foto's, iconen, CNAME, .nojekyll) worden weer gebruikt.

Staat de oude versie nog op je telefoon? Open de site één keer opnieuw, of ververs
de pagina. Daarna wordt de nieuwe versie geladen.

## Een recept toevoegen of aanpassen

1. Ga naar **https://garaj.nl/beheer/**.
2. Kies een recept of klik op **+ Nieuw recept**.
3. Vul alles in, upload een foto, bekijk het voorbeeld en klik op **Recept bewaren**.
4. Klik onderaan op **Download websitepakket**. Je krijgt een zip-bestand.
5. Pak de zip uit en upload de inhoud op GitHub, zoals hierboven bij stap 2 tot en met 4.

Tot je het pakket online zet, bewaart het formulier je werk als concept in die browser.
Zodra de nieuwe versie live staat, ruimt het formulier dat concept vanzelf op.

## Wat er in deze map staat

| Bestand of map | Wat het is |
|---|---|
| `recepten.js` | Alle recepten. Dit bestand wordt door het beheerformulier gemaakt. |
| `index.html`, `404.html` | De startpagina. Wordt automatisch gemaakt. |
| `recept/<naam>/index.html` | Elk recept op een eigen webadres, met receptgegevens voor Google. Wordt automatisch gemaakt. |
| `bouw.js` | De bouwstenen van alle pagina's. Gebruikt door de site, het formulier en het bouwscript. |
| `app.js` | Alles wat beweegt: kookmodus, wekkers, porties, boodschappenlijst, delen, zoeken. |
| `style.css` | Huisstijl: kleuren, letters en opmaak, ook voor printen en de donkere modus. |
| `sw.js` | Zorgt dat de site offline werkt en installeerbaar is. |
| `sitemap.xml`, `robots.txt` | Helpen Google de recepten te vinden. Het beheerformulier wordt niet geïndexeerd. |
| `beheer/` | Het beheerformulier. |
| `tools/bouw.js` | Optioneel. Wie Node.js heeft, kan na een handmatige wijziging in `recepten.js` met `node tools/bouw.js` alle pagina's opnieuw maken. |

## Na de livegang: aanmelden bij Google

1. Meld garaj.nl aan in **Google Search Console** (search.google.com/search-console).
2. Dien `https://garaj.nl/sitemap.xml` in.
3. Test een recept in de **Rich Results Test** (search.google.com/test/rich-results).
   Je hoort daar "Recept" als geldig resultaat te zien.
