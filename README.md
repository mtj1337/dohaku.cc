# Dohaku.cc - Správa událostí

## Jak přidat a zobrazit události pro všechny uživatele

Po aktualizaci webu se události ukládají do souboru `events.json`, který zajišťuje, že všichni návštěvníci uvidí stejné události v kalendáři.

### Postup při přidání nebo úpravě události:

1. Přihlaste se do admin panelu
2. Vytvořte nebo upravte událost
3. Po vytvoření/úpravě se automaticky stáhne aktualizovaný soubor `events.json`
4. **Důležité:** Tento soubor nahrajte na server, aby změny viděli všichni návštěvníci

### Postup při smazání události:

1. Smažte událost v admin panelu
2. Stáhne se aktualizovaný soubor `events.json`
3. **Důležité:** Tento soubor nahrajte na server

## Technické detaily

Pro vývoj a testování se používá lokální úložiště (localStorage), ale pro sdílení událostí mezi všemi uživateli je nutné aktualizovat soubor `events.json` na serveru. Web automaticky kontroluje aktualizace každých 5 sekund.

Pokud by v budoucnu byla potřeba více automatizace, doporučujeme implementovat serverové API pro správu událostí.
