# Dohaku.cc - Administrátorská dokumentace

## Správa eventů

Náš web nyní používá soubor `events.json` jako hlavní zdroj dat pro události zobrazované v kalendáři. Všechny události jsou uloženy v tomto souboru ve formátu JSON a jsou automaticky načítány při návštěvě stránky.

### Jak správně aktualizovat události

1. **Přihlaste se do admin panelu** na stránce `/admin.html`

2. **Vytvoření nové události:**
   - Klikněte na tlačítko "Vytvořit nový event"
   - Vyplňte všechny požadované údaje
   - Po dokončení se automaticky stáhnou dva soubory:
     - `[nazev-stranky].html` - HTML stránka události
     - `events.json` - aktualizovaný seznam událostí
   - **Oba soubory nahrajte na server**

3. **Úprava existující události:**
   - Klikněte na tlačítko "Upravit" u příslušné události
   - Upravte požadované údaje
   - Po dokončení se automaticky stáhnou dva soubory:
     - `[nazev-stranky].html` - aktualizovaná HTML stránka události
     - `events.json` - aktualizovaný seznam událostí
   - **Oba soubory nahrajte na server**

4. **Smazání události:**
   - Klikněte na tlačítko "Smazat" u příslušné události
   - Potvrďte smazání
   - Stáhne se aktualizovaný soubor `events.json`
   - **Nahrajte soubor events.json na server**
   - Volitelně můžete také smazat HTML soubor události ze serveru

### Důležité poznámky

- **Vždy nahrajte aktualizovaný soubor events.json na server** po jakékoliv změně v událostech
- Systém používá localStorage jako záložní řešení, pokud nelze načíst events.json
- Pro zachování konzistence dat se vždy snažte pracovat s aktuální verzí events.json
- Pokud se události nezobrazují správně, zkontrolujte:
  1. Zda je soubor events.json správně nahrán na server
  2. Zda má soubor správný formát JSON
  3. Zda jsou všechny HTML stránky událostí správně nahrány

### Struktura události v events.json

Každá událost v souboru events.json má následující strukturu:

```json
{
  "pageName": "nazev-stranky",  // Název HTML souboru bez přípony .html
  "title": "Název události",   // Zobrazovaný název události
  "day": 8,                   // Den v měsíci
  "month": 5,                 // Měsíc (0-11, kde 0 je leden)
  "year": 2025                // Rok
}
```

V případě jakýchkoliv problémů nebo otázek kontaktujte správce systému.
