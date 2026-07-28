# Akcja Kawowa

Strona wewnętrzna. Akcja kawowa - losowanie osoby kupującej kawę.

## Pliki

```
app/
├── index.html          ← struktura strony (1 plik, tylko <div id="app">)
├── style.css           ← wszystkie style, komentarze z numerami sekcji
└── js/                 ← logika, jako natywne ES modules (bez bundlera)
    ├── supabase.js      konfiguracja + REST helpers (sb.get/post/patch/uploadPhoto)
    ├── state.js         stan aplikacji (state) + loadData() z Supabase
    ├── helpers.js        selektory/pomocnicze funkcje czyste (memberById, inGame, rankedCoffees...)
    ├── render-tabs.js    renderery 5 zakładek (Losowanie/Zespół/Historia/Statystyki/Ranking)
    ├── render-modals.js  renderery modali (zakup, ocena, karta kawy, dodaj/edytuj uczestnika)
    ├── render.js         render() główny + topbar/tabs/routing zakładek
    ├── animations.js     bęben losowania, Giphy, konfetti
    ├── toast.js          powiadomienia na dole ekranu
    ├── actions.js        akcje zapisu do Supabase (savePurchase, saveRating, startDraw...)
    ├── events.js         attachEvents() — podpięcie handlerów po każdym renderze
    └── main.js           punkt wejścia (init → loadData → render)
```

### `index.html`
Wciąga `style.css` i ładuje `js/main.js` jako `<script type="module">`. Cała strona jest budowana w JavaScripcie.

Brak bundlera — moduły importują się nawzajem po względnych ścieżkach (`import ... from './helpers.js?v=...'`).
Parametr `?v=` służy do omijania cache przeglądarki; przy każdej zmianie kodu trzeba go
zbiorczo podbić w `index.html` **i** we wszystkich `import` w plikach `js/*.js` (szukaj `?v=20260728`).

### `style.css`
Komentarze z numerami sekcji.

### `data.json`
Nieaktualne — stan trzymany jest teraz w Supabase (patrz `js/supabase.js`), nie w `data.json`.

## Co do dorobienia

- Zapis do `data.json` przez GitHub API — teraz zmiany są tylko w pamięci, znikają po odświeżeniu
- Upload zdjęcia kupionej kawy (też przez GitHub API)
- Formularz oceny kawy (każdy ze swojego konta)
- Eksport historii do CSV / kalendarza (.ics)
- Modal "+ dodaj osobę" / "edytuj"
- Klucz Giphy własny zamiast publicznego (publiczny ma niski rate limit)

## Plan: zapis przez GitHub API

Zarys (do zaimplementowania w kolejnym kroku):

1. Wygeneruj **Personal Access Token** na GitHubie (uprawnienia: `repo`)
2. W `app.js` dodaj funkcję `saveData()`:
   - czyta token z `localStorage` (każdy user wkleja go raz)
   - robi PUT na `https://api.github.com/repos/USER/REPO/contents/app/data.json`
   - body: nowy `data.json` zakodowany w base64 + SHA poprzedniego pliku
3. Wołaj `saveData()` po każdym losowaniu / dodaniu osoby / itd.

Plik `data.json` w repo staje się "bazą danych". Każda zmiana = git commit. Historia commitów = audyt.


## Wyglądu

Wszystkie kolory są zmiennymi CSS na górze `style.css` (sekcja 1):

```css
:root {
  --coffee:    #8b5a2b;   /* główny akcent */
  --paper:     #f7f3ec;   /* tło */
  ...
}
```
