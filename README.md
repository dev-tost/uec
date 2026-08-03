# Akcja Kawowa

Strona wewnętrzna. Akcja kawowa - losowanie osoby kupującej kawę.

## Pliki

```
index.html             ← cała struktura strony (jeden plik, prawie pusty — resztę dorysowuje JavaScript)
style.css               ← wszystkie style, poukładane w sekcje
js/                      ← logika strony, podzielona na pliki (bez żadnego bundlera/build-toola)
├── supabase.js       łączy się z bazą danych Supabase — pobiera i zapisuje dane oraz zdjęcia
├── state.js          trzyma aktualny stan aplikacji i wczytuje dane z Supabase przy starcie
├── helpers.js        drobne funkcje pomocnicze (np. znajdź osobę po ID, kto gra w tej rundzie, ranking kaw)
├── render-tabs.js    rysuje 5 zakładek (Losowanie/Zespół/Historia/Statystyki/Ranking)
├── render-modals.js  rysuje okienka (zakup, ocena, karta kawy, dodaj/edytuj uczestnika)
├── render.js         główna funkcja rysująca stronę — pasek u góry, zakładki i to co aktualnie wybrane
├── animations.js     animacja losowania (bęben), losowy gif z Giphy, konfetti
├── toast.js          małe powiadomienia na dole ekranu (np. "zapisano")
├── actions.js        wszystko, co zapisuje dane do Supabase (nowy zakup, ocena, losowanie...)
├── events.js         podpina obsługę kliknięć pod przyciski — uruchamia się po każdym rysowaniu strony
└── main.js           punkt startowy: wczytaj dane, narysuj stronę
```

### `index.html`

Wciąga `style.css` i ładuje `js/main.js` jako `<script type="module">`. Cała strona jest budowana w JavaScripcie.

Brak bundlera — moduły importują się nawzajem po względnych ścieżkach (`import ... from './helpers.js?v=...'`).
Parametr `?v=` służy do omijania cache przeglądarki; przy każdej zmianie kodu trzeba go
zbiorczo podbić w `index.html` **i** we wszystkich `import` w plikach `js/*.js`. Robi to automatycznie:

```
node scripts/bump-cache-version.js
```

### `style.css`

Komentarze z numerami sekcji.

### Baza danych

Cały stan trzymany jest w Supabase (adres i klucz publiczny na górze `js/supabase.js`).

Tabele: `team`, `rounds`, `draws`, `coffees`, `purchases`, `ratings`. Zdjęcia kupionej kawy lądują w Storage
buckecie `coffee-photos` (upload przez `sb.uploadPhoto()`).

`js/state.js` przy starcie pobiera wszystko naraz (`loadData()`) i normalizuje do jednej struktury `state.data`.

### Kim jestem

Przy pierwszym wejściu użytkownik wybiera siebie z listy zespołu — wybór zapamiętywany jest w `localStorage`
(`akcja-kawowa-who`). Na tej podstawie strona wie, kto aktualnie ocenia kawę / czyja jest kolej (patrz `state.whoAmI`).

## Narzędzia deweloperskie

Wymaga `npm install` (tylko narzędzia jakości kodu, apka nadal działa bez żadnego builda).

```
npm run lint          sprawdza kod pod kątem błędów (ESLint)
npm run format         formatuje wszystkie pliki (Prettier)
npm run format:check   sprawdza formatowanie bez zmieniania plików
npm run bump-version   podbija cache-busting (patrz wyżej)
```

## Wygląd

Wszystkie kolory są zmiennymi CSS na górze `style.css` (sekcja 1):

```css
:root {
  --paper:   #ffffff;   /* tło strony */
  --coffee:  #030213;   /* akcent główny */
  --ink:     #1b1b1f;   /* główny tekst */
  --danger:  #d4183d;   /* błąd / out */
  ...
}
```
