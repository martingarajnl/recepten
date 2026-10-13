/* =====================================================================
   GARAJ RECEPTEN
   Dit bestand wordt gemaakt door het beheerformulier op garaj.nl/beheer.
   Liever met de hand aanpassen? Dat kan; let op de komma's en aanhalingstekens.

   ingredienten (items): [hoeveelheid, eenheid, naam, toelichting]
     hoeveelheid null + eenheid ""           = komt in de regel "Naar smaak"
     hoeveelheid null + eenheid "naar wens"  = eigen regel zonder getal
     hoeveelheid [1, 2]                      = van-tot
   stappen: timer = minuten voor de kookwekker
   foto: bestandsnaam van de foto, vierkant (bijv. "bolognesesaus.jpg")
   toegevoegd: datum "JJJJ-MM-DD"; het label Nieuw staat er 60 dagen
   lekkerBij: slug van een ander recept, of vrije tekst
   ===================================================================== */
var GARAJ_DATA = {
  "versie": "2026-10-13.2",
  "GANGEN": [
    {
      "id": "soep",
      "naam": "Soepen & voorgerechten",
      "kort": "Soepen",
      "foto": "gang-soep.jpg"
    },
    {
      "id": "hoofdgerecht",
      "naam": "Hoofdgerechten",
      "kort": "Hoofdgerechten",
      "foto": "gang-hoofdgerecht.jpg"
    },
    {
      "id": "bijgerecht",
      "naam": "Bijgerechten & salades",
      "kort": "Bijgerechten",
      "foto": "gang-bijgerecht.jpg"
    },
    {
      "id": "dessert",
      "naam": "Desserts",
      "kort": "Desserts"
    }
  ],
  "LABELS": {
    "vooraf": "vooraf te maken",
    "barbecue": "barbecue",
    "vegetarisch": "vegetarisch",
    "comfortfood": "comfortfood",
    "pittig": "pittig",
    "laag-traag": "laag en traag"
  },
  "RECEPTEN": [
    {
      "slug": "griekse-witte-koolsalade",
      "titel": "Griekse witte koolsalade",
      "gang": "bijgerecht",
      "labels": [
        "vooraf",
        "barbecue",
        "vegetarisch"
      ],
      "favoriet": true,
      "foto": "griekse-witte-koolsalade.jpg",
      "toegevoegd": "",
      "noot": "Na jarenlang experimenteren, weinig genieten en veel weggooien is het eindelijk gelukt. Heerlijk als het 30 graden is en de barbecue aan staat.",
      "intro": "Het basisrecept om witte kool op een Griekse manier te bereiden. Naar wens snijd je er nog een worteltje in julienne, wat paprika of komkommer bij.",
      "tijd": "± 3 dagen, waarvan 20 minuten werk",
      "porties": 1,
      "portieWoord": [
        "kool",
        "kolen"
      ],
      "benodigdheden": [
        "Vergiet",
        "Kom"
      ],
      "onderdelen": [
        {
          "kop": null,
          "items": [
            [
              1,
              "",
              "witte kool",
              "vers en ongesneden"
            ],
            [
              6,
              "el",
              "azijn",
              "ik gebruik witte wijnazijn"
            ],
            [
              4,
              "el",
              "olijfolie"
            ],
            [
              2,
              "el",
              "zout"
            ],
            [
              1,
              "el",
              "suiker",
              "optioneel; ik laat hem weg, ik houd van zuur"
            ],
            [
              0.5,
              "l",
              "mineraalwater met bubbels"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Snijden",
          "tekst": "Snijd de kool door de helft en snijd het harde gedeelte er in een driehoek uit. Snijd de kool in de lengte in dunne stukken. Raspen kan ook, maar ongelijke stukjes vind ik juist lekker. Doe de kool in het vergiet."
        },
        {
          "kop": "Zouten en kneden",
          "tijd": "5 min + 30 min uitlekken",
          "timer": 30,
          "timerNaam": "Kool uitlekken",
          "tekst": "Strooi het zout over de kool en kneed het er 5 minuten stevig in. In kleinere porties kneden is minder zwaar en net zo effectief. Laat de kool een half uur uitlekken boven de gootsteen of een pan en gooi het vocht weg."
        },
        {
          "kop": "Aanmaken",
          "tijd": "24 uur",
          "tekst": "Giet de azijn, de olijfolie en eventueel de suiker over de kool. Kneed nog 2 minuten en zet de kool afgedekt 24 uur in de koelkast."
        },
        {
          "kop": "Mineraalwater",
          "tijd": "minimaal 48 uur",
          "tekst": "Je ruikt nu een sterke koolgeur en de kool smaakt erg zout. Dat hoort zo. Giet het mineraalwater erover, schep om met twee lepels en zet de kool minimaal 48 uur weg. Tot 5 dagen in de koelkast geeft het beste resultaat."
        }
      ],
      "tip": "Na het mineraalwater verandert de geur snel. Blijf proeven. Te zout? Spoel de kool in het vergiet met koud water. Te zuur? Spoelen of een beetje suiker toevoegen.",
      "lekkerBij": [
        "Alles van de barbecue",
        "kip-paprikasch"
      ]
    },
    {
      "slug": "bolognesesaus",
      "titel": "Bolognesesaus",
      "gang": "hoofdgerecht",
      "labels": [
        "comfortfood",
        "laag-traag"
      ],
      "favoriet": true,
      "foto": "bolognesesaus.jpg",
      "toegevoegd": "",
      "noot": "Het geheim zit in de tomatenpuree die je apart in de pan bakt, en in de pasta die je met een scheut kookwater door de saus roert.",
      "intro": "Een volle saus die minimaal een uur zachtjes trekt. Langer mag altijd, zolang alles onder vocht staat.",
      "tijd": "± 1 uur 20 min",
      "porties": 4,
      "portieWoord": [
        "persoon",
        "personen"
      ],
      "onderdelen": [
        {
          "kop": null,
          "items": [
            [
              400,
              "g",
              "gemengd gehakt"
            ],
            [
              1,
              "",
              "wortel"
            ],
            [
              1,
              "",
              "ui"
            ],
            [
              1,
              "",
              "stengel bladselderij"
            ],
            [
              [
                1,
                2
              ],
              "dl",
              "rode wijn",
              "fruitig"
            ],
            [
              1,
              "",
              "laurierblad"
            ],
            [
              0.5,
              "l",
              "runderbouillon"
            ],
            [
              null,
              "",
              "tomatenpuree"
            ],
            [
              null,
              "",
              "Italiaanse kruiden"
            ],
            [
              null,
              "",
              "olijfolie"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Dichtschroeien en blussen",
          "tekst": "Verhit een beetje olijfolie in een ruime pan. Bak het gehakt met Italiaanse kruiden tot het dichtgeschroeid is; niet rul bakken. Maak het gehakt tijdens het bakken los met een garde. Blus met de wijn en roer een paar minuten tot de alcohol verdampt is."
        },
        {
          "kop": "Groente en tomatenpuree",
          "tijd": "± 9 min",
          "timer": 9,
          "timerNaam": "Groente en puree",
          "tekst": "Voeg de fijngehakte wortel, ui en bladselderij toe en bak 2 minuten mee. Maak een plekje vrij in de pan en bak de tomatenpuree daar 2 minuten direct in de pan; zo wordt hij zoeter. Meng alles en bak nog 5 minuten op middelhoog vuur."
        },
        {
          "kop": "Laten trekken",
          "tijd": "minimaal 1 uur",
          "timer": 60,
          "timerNaam": "Bolognese trekken",
          "tekst": "Voeg runderbouillon toe tot alles onder staat. Leg het laurierblad erin en zet de deksel iets schuin op de pan. Laat minimaal een uur zachtjes trekken. Je kunt de saus uitbreiden met gezeefde tomaten of een potje arrabbiatasaus."
        }
      ],
      "tip": "Lekker uit te breiden met champignons. Roer de spaghetti of andere pasta door de saus met een scheut kookwater van de pasta.",
      "lekkerBij": [
        "Spaghetti of andere pasta, met een scheut kookwater door de saus"
      ]
    },
    {
      "slug": "kip-paprikasch",
      "titel": "Garaj's kip-paprikasch",
      "gang": "hoofdgerecht",
      "labels": [
        "comfortfood",
        "laag-traag"
      ],
      "favoriet": true,
      "foto": "kip-paprikasch.jpg",
      "toegevoegd": "",
      "noot": "Mijn eigen special. Een gladde paprikasaus door de groenten te pureren, een uur laten intrekken en verse frieten erbij.",
      "intro": "Kip in een gladde saus van paprika, ui en flink wat paprikapoeder. Neem de tijd: laag vuur en om de vijf minuten roeren.",
      "tijd": "± 1 uur 45 min",
      "porties": 4,
      "portieWoord": [
        "persoon",
        "personen"
      ],
      "onderdelen": [
        {
          "kop": null,
          "items": [
            [
              800,
              "g",
              "kipfilet"
            ],
            [
              2,
              "",
              "rode paprika's"
            ],
            [
              2,
              "",
              "middelgrote uien"
            ],
            [
              3,
              "",
              "tenen knoflook"
            ],
            [
              2,
              "",
              "kipbouillonblokjes",
              "voor 1 liter bouillon"
            ],
            [
              1,
              "",
              "klein blikje tomatenpuree"
            ],
            [
              null,
              "naar wens",
              "verse peterselie"
            ]
          ]
        },
        {
          "kop": "Kruiden en verder",
          "items": [
            [
              null,
              "naar wens",
              "paprikapoeder",
              "flink"
            ],
            [
              null,
              "",
              "Vegeta"
            ],
            [
              null,
              "",
              "witte peper"
            ],
            [
              null,
              "",
              "kookroom"
            ],
            [
              null,
              "",
              "bloem om te binden"
            ],
            [
              null,
              "",
              "olijfolie, roomboter en Croma"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Bouillon",
          "tekst": "Maak 1 liter kipbouillon en laat hem afkoelen. Koud hoeft niet."
        },
        {
          "kop": "Kip aanbraden",
          "tekst": "Snijd de kipfilet schoon en in blokjes. Kruid goed met Vegeta en witte peper. Bak de kip in Croma in een pan met een goede antiaanbaklaag. De kip hoeft niet gaar, wel mooi bruin van buiten. Laat afkoelen op een bord."
        },
        {
          "kop": "Groentepap",
          "tijd": "± 15 min",
          "timer": 15,
          "timerNaam": "Groentepap",
          "tekst": "Doe een beetje olijfolie en roomboter in dezelfde pan. Snijd de uien en paprika's grof en bak ze zacht zonder dat ze kleuren. Bak daarna de fijngesneden knoflook nog 5 minuten mee. Pureer alles met de staafmixer tot een gladde pap."
        },
        {
          "kop": "Samenvoegen en laten trekken",
          "tijd": "minimaal 1 uur",
          "timer": 60,
          "timerNaam": "Paprikasch trekken",
          "tekst": "Doe olijfolie in de pan met de kip en flink wat paprikapoeder en bak mee. Roer de tomatenpuree erdoor en bak 5 minuten door. Voeg de bouillon, de groentepap en de fijngesneden peterselie toe. Laat minimaal een uur intrekken op laag vuur en roer om de 5 minuten."
        },
        {
          "kop": "Binden en serveren",
          "tekst": "Maak verse frieten erbij. Is de kip-paprikasch nog te waterig? Schud wat bloem door een zeefje boven de pan en roer tot de saus gebonden is."
        }
      ],
      "tip": "De groentepap is het hart van dit gerecht. Laat de uien en paprika's echt zacht worden voordat je mixt.",
      "lekkerBij": [
        "Verse frieten",
        "griekse-witte-koolsalade"
      ]
    },
    {
      "slug": "kip-boursin",
      "titel": "Kip boursin",
      "gang": "hoofdgerecht",
      "labels": [
        "comfortfood",
        "laag-traag"
      ],
      "favoriet": false,
      "foto": "kip-boursin.jpg",
      "toegevoegd": "",
      "intro": "Kip die anderhalf uur zachtjes gaart in champignonsoep en wordt afgemaakt met Boursin, sambal en kookroom.",
      "tijd": "± 2 uur",
      "porties": 4,
      "portieWoord": [
        "persoon",
        "personen"
      ],
      "onderdelen": [
        {
          "kop": null,
          "items": [
            [
              800,
              "g",
              "kipfilet"
            ],
            [
              1,
              "l",
              "champignonsoep",
              "ik gebruik Unox"
            ],
            [
              2,
              "",
              "middelgrote uien"
            ],
            [
              1,
              "",
              "pakje Boursin",
              "150 g, knoflook en fijne kruiden"
            ],
            [
              null,
              "",
              "Vegeta"
            ],
            [
              null,
              "",
              "witte peper"
            ],
            [
              null,
              "",
              "sambal"
            ],
            [
              null,
              "",
              "kookroom"
            ],
            [
              null,
              "",
              "bloem om te binden"
            ],
            [
              null,
              "",
              "olie, roomboter en Croma"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Kip aanbraden",
          "tekst": "Snijd de kipfilet schoon en in blokjes. Kruid goed met Vegeta en witte peper. Bak de kip in Croma in een pan met een goede antiaanbaklaag. De kip hoeft niet gaar, wel mooi bruin van buiten. Laat afkoelen op een bord."
        },
        {
          "kop": "Uien",
          "tekst": "Snijd de uien klein en bak ze in olie en roomboter. Ze mogen niet bruin worden, wel zacht. Voeg de kip weer toe."
        },
        {
          "kop": "Garen",
          "tijd": "minimaal 1,5 uur",
          "timer": 90,
          "timerNaam": "Kip boursin garen",
          "tekst": "Voeg de champignonsoep toe en laat alles op laag vuur minimaal anderhalf uur garen. Roer af en toe."
        },
        {
          "kop": "Afmaken",
          "tekst": "Roer de Boursin door de saus tot hij helemaal gesmolten is. Voeg daarna een beetje sambal en kookroom toe. Bind eventueel met een beetje bloem."
        }
      ],
      "lekkerBij": [
        "Rijst of verse frieten"
      ]
    },
    {
      "slug": "servische-bonensoep",
      "titel": "Servische bonensoep",
      "gang": "soep",
      "labels": [
        "pittig",
        "comfortfood"
      ],
      "favoriet": false,
      "foto": "servische-bonensoep.jpg",
      "toegevoegd": "",
      "intro": "Stevige soep met pittige Debrecener worst, witte bonen en paprika. Gebonden en afgemaakt met een scheut room.",
      "tijd": "± 45 min",
      "porties": 4,
      "portieWoord": [
        "persoon",
        "personen"
      ],
      "onderdelen": [
        {
          "kop": null,
          "items": [
            [
              null,
              "naar wens",
              "Debrecener worst",
              "pittige worst uit Hongarije en de Balkan"
            ],
            [
              1,
              "",
              "grote ui",
              "gesnipperd"
            ],
            [
              [
                1,
                2
              ],
              "",
              "preien",
              "gesneden, met veel groen"
            ],
            [
              2,
              "",
              "middelgrote wortels"
            ],
            [
              1,
              "",
              "teen knoflook",
              "in plakjes"
            ],
            [
              1,
              "",
              "rode paprika",
              "ontveld"
            ],
            [
              1,
              "",
              "aardappel",
              "in kleine blokjes"
            ],
            [
              200,
              "ml",
              "tomatensaus"
            ],
            [
              720,
              "g",
              "witte bonen in tomatensaus"
            ],
            [
              1,
              "",
              "kipbouillonblokje"
            ]
          ]
        },
        {
          "kop": "Kruiden en afmaken",
          "items": [
            [
              null,
              "",
              "Vegeta"
            ],
            [
              null,
              "",
              "paprikapoeder"
            ],
            [
              null,
              "",
              "chilipoeder"
            ],
            [
              null,
              "",
              "tijm"
            ],
            [
              null,
              "",
              "oregano"
            ],
            [
              null,
              "",
              "bloem"
            ],
            [
              null,
              "",
              "kookroom"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Groente aanbakken",
          "tekst": "Verhit olie in een soeppan. Bak de ui, prei, wortel, knoflook en paprika met Vegeta. De groente mag niet bruin worden; blus zo nodig met een scheut water."
        },
        {
          "kop": "Water, worst en kruiden",
          "tekst": "Vul aan met water en voeg de worst in kleine plakjes toe, samen met de aardappel en de tomatensaus. Voeg paprikapoeder, chilipoeder, tijm en oregano toe en verkruimel het bouillonblokje erboven."
        },
        {
          "kop": "Bonen",
          "tekst": "Voeg de bonen toe. Roer voorzichtig, zodat ze heel blijven."
        },
        {
          "kop": "Binden en afmaken",
          "tekst": "Schud bloem door een zeefje boven de soep tot de vetoogjes weg zijn. Maak af met kookroom en laat 10 seconden opkoken."
        }
      ],
      "lekkerBij": [
        "Vers brood"
      ]
    },
    {
      "slug": "grieks-knoflookbrood-fetadip",
      "titel": "Grieks knoflookbrood met pittige paprika-fetadip",
      "gang": "soep",
      "labels": [
        "pittig",
        "vegetarisch"
      ],
      "favoriet": false,
      "foto": "grieks-knoflookbrood-fetadip.jpg",
      "toegevoegd": "2026-10-10",
      "intro": "Knapperige ciabatta met boter van geroosterde knoflook, met daarbij een romige dip van feta, Griekse yoghurt, geroosterde paprika en chilivlokken. Terwijl de knoflook in de oven zit, maak je de dip.",
      "tijd": "± 45 min, waarvan 20 minuten werk",
      "porties": 1,
      "portieWoord": [
        "schaal",
        "schalen"
      ],
      "benodigdheden": [
        "Keukenmachine",
        "Knoflookpers",
        "Bakblik met bakpapier",
        "Kom"
      ],
      "onderdelen": [
        {
          "kop": "Pittige paprika-fetadip",
          "items": [
            [
              275,
              "g",
              "feta",
              "zo goed mogelijk, liefst Griekse feta uit het vat"
            ],
            [
              200,
              "g",
              "Griekse yoghurt"
            ],
            [
              1,
              "",
              "geroosterde rode paprika",
              "zelf geroosterd of uit een pot"
            ],
            [
              1,
              "",
              "teen knoflook"
            ],
            [
              2,
              "tl",
              "chilivlokken",
              "of 1 verse chilipeper"
            ],
            [
              2,
              "el",
              "olijfolie"
            ]
          ]
        },
        {
          "kop": "Knoflookbrood",
          "items": [
            [
              1,
              "",
              "afbakciabatta"
            ],
            [
              100,
              "g",
              "ongezouten roomboter",
              "op kamertemperatuur"
            ],
            [
              0.5,
              "",
              "bol knoflook",
              "tenen ongepeld"
            ],
            [
              null,
              "naar wens",
              "verse peterselie",
              "een paar takjes, fijngehakt"
            ],
            [
              1,
              "tl",
              "cayennepeper"
            ],
            [
              null,
              "",
              "zeezout uit de molen"
            ]
          ]
        }
      ],
      "stappen": [
        {
          "kop": "Knoflook roosteren",
          "tijd": "20–25 min",
          "timer": 25,
          "timerNaam": "Knoflook roosteren",
          "tekst": "Verwarm de oven voor op 200 °C. Leg de ongepelde knoflooktenen op het bakblik met bakpapier en rooster ze in het midden van de oven tot de schil kleurt en de knoflook binnenin zacht is. Maak intussen de dip."
        },
        {
          "kop": "Dip: knoflook en paprika",
          "tekst": "Pers de verse teen knoflook boven de keukenmachine, zodat hij fijn genoeg is na het mixen. Voeg de geroosterde paprika toe. Paprika uit een pot? Laat hem eerst goed uitlekken en dep hem droog, anders wordt de dip te dun."
        },
        {
          "kop": "Dip: olie, chili en yoghurt",
          "tekst": "Voeg de olijfolie en de chilivlokken toe en mix 10 seconden. Voeg de Griekse yoghurt toe en mix nog 10 seconden."
        },
        {
          "kop": "Dip: feta",
          "tekst": "Verkruimel de feta erboven en mix een laatste keer tot de dip glad en romig is. Niet te lang doordraaien; dan wordt feta korrelig. Zet de dip afgedekt in de koelkast tot het brood klaar is."
        },
        {
          "kop": "Knoflookboter",
          "tekst": "Roer de roomboter los in een kom. Knijp de geroosterde knoflook uit de schil en voeg hem met de peterselie toe. Prak de knoflook fijn en roer alles goed door elkaar. Breng op smaak met cayennepeper en zeezout."
        },
        {
          "kop": "Brood bakken",
          "tijd": "8–10 min",
          "timer": 10,
          "timerNaam": "Knoflookbrood bakken",
          "tekst": "Snijd de ciabatta in plakken en smeer ze royaal in met de knoflookboter. Leg ze op het bakblik en bak ze in het midden van de oven goudbruin en knapperig."
        },
        {
          "kop": "Serveren",
          "tekst": "Schep de dip in een schaal, giet er een scheutje olijfolie over en strooi er eventueel wat extra chilivlokken op. Serveer met het warme knoflookbrood."
        }
      ],
      "tip": "De dip kun je een dag van tevoren maken; afgedekt in de koelkast blijft hij 3 tot 4 dagen goed, maar nooit langer dan de datum van de yoghurt. Invriezen raad ik af. Het brood kun je ook vooraf smeren en koel bewaren; warm het op in een voorverwarmde oven, afgedekt met aluminiumfolie.",
      "lekkerBij": [
        "Een borrelplank met olijven",
        "griekse-witte-koolsalade"
      ]
    }
  ]
};
