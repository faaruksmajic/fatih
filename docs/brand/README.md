# Fatih Škrijelj — Brand smjernice

Izvor istine za izgled i glas sitea fatiharch.online. Logo fajlovi su u ovom folderu, a paleta je i u `colors.json`. Tokeni žive u `src/app/globals.css` (`:root`), fontovi u `src/app/fonts.ts`. Kad se nešto ovdje promijeni, mijenja se i tamo.

## 1. Ideja: „Precizan nacrt“

Fatih je prvo radio kao arhitektonski tehničar, pa tek onda počeo projektovati. Brand to pokazuje: sve izgleda kao pažljivo nacrtan list. Tanke linije, mjere, numeracija i mirni tonovi. Nema ukrasa koji nemaju funkciju.

Motivi koji to nose (već postoje na siteu, čuvati ih):

- **Loader** koji crta liniju i kotu prije otvaranja stranice.
- **Alati** kao list sa mrežom i oznakama `T-01`, `T-02`…
- **Footer** kao sastavnica (title block) na nacrtu.
- **Numerisane sekcije** `01 — O meni`, `02 — Usluge`… kao listovi u projektu.

## 2. Logo

- Znak **AF**: tanke kose linije, pun klin i puno stablo slova F. Original: `public/images/logo.png`. Vektorska verzija (izvor istine za web): `src/components/AfMark.tsx`.
- Na webu se znak koristi **bez kruga i bez pozadine**, direktno na podlozi, u boji akcenta. Uz njega ide ime **velikim slovima**, Archivo raširen: `FATIH ŠKRIJELJ`, ispod sitno `Arhitektura`.
- **Debljina linija prema veličini:** original (linija 6) od ~200px naviše; navigacija oko 56px → linija 14; footer oko 40px → linija 18.
- **Favicon** (`src/app/icon.svg`, `src/app/apple-icon.png`) je debela, pojednostavljena verzija, jer se tanke linije na 16px ne vide. Ravna boja pijeska na noćnoj podlozi, pravi uglovi, bez gradijenta.
- **Slika za dijeljenje linka:** `public/images/og-square.png` (600×600): samo znak na noćnoj podlozi. Kvadratna je namjerno, da se u porukama (WhatsApp, Viber, Messenger, X) prikaže kao mala sličica pored naslova, a ne kao veliki baner. Ime i opis dolaze iz naslova i opisa stranice.
- **Fajlovi za print, PDF i CV** su u ovom folderu (`docs/brand/`):
  - `af-mark-{sand,sand-dark,graphite,white}.svg` i `.png` (2000px, providna pozadina)
  - `lockup-{sand,graphite,white}.png`: znak i ime u jednom redu
  - Pijesak (`sand`) ide na tamnu podlogu, a `sand-dark` i `graphite` na papir.
- Ne: rastezati znak, stavljati ga u krug ili značku, dodavati sjenke, sjaj ili gradijent, ili ga slagati na šarenu fotografiju bez sloja.

## 3. Boje

Site prati postavku uređaja: **Noćni nacrt** u tamnom načinu i **Paus** u svijetlom. Elementi preko fotografija (kartice projekata, hero projekta, galerija, lightbox) uvijek su svijetli tekst na tamnom sloju.

| Token | Noćni nacrt (tamno) | Paus (svijetlo) | Uloga |
|---|---|---|---|
| `--bg` | `#131a22` | `#f3f0ea` | Pozadina: noćna tinta / paus papir |
| `--panel` | `#1b2430` | `#e8e4dc` | Paneli, trake sekcija |
| `--panel-2` | `#222c3a` | `#dfdad0` | Izdignuti paneli |
| `--text` | `#eef1f4` | `#1d2024` | Glavni tekst |
| `--text-2` | `#bcc5cf` | `#4a4d52` | Sporedni tekst, paragrafi |
| `--muted` | `#8f9aa6` | `#6e6c67` | Labele, meta |
| `--accent` | `#c9a682` | `#8a6640` | Pijesak: oznake, brojevi, glavno dugme, znak |
| `--accent-hover` | `#dcc0a1` | `#6f5133` | Hover glavnog dugmeta |
| `--line` / `--line-strong` | tekst 8% / 16% | tekst 8% / 16% | Tanke linije i razdjelnici |

Kontrast (WCAG): tamno, tekst 15.5:1 i akcent 7.7:1; svijetlo, tekst 14.4:1 i akcent 4.6:1. Prozirne linije i slojevi se pišu kao `rgb(var(--text-rgb) / 0.08)`, nikad kao fiksna `rgba`, da rade u obje teme. Admin koristi svoje fiksne boje (`--paper`, `--ink`).

Pravila:

- Pijesak je **jedini** akcent. Bez drugih boja, osim boja brendova u Tools sekciji na hover.
- Pijesak se koristi štedljivo: za oznake, brojeve, znak i jedno glavno dugme po ekranu.
- Bez gradijenata u UI-ju. Jedini dozvoljeni prelaz je sloj preko fotografija, u boji pozadine, da tekst bude čitljiv.

## 4. Tipografija

Dvije porodice, tri uloge:

| Uloga | Font | Kako |
|---|---|---|
| **Naslovi (display)** | Archivo, raširen (`font-stretch: 125%`) | H1/H2 velikim slovima, tanko (200–300), blagi razmak `0.01–0.02em`. H3 i naslovi projekata u normalnim slovima, težina 500. |
| **Tekst** | Archivo, normalna širina | 17px, prored 1.65, težina 400. Paragrafi do ~65 znakova širine. |
| **Oznake („kote“)** | Source Code Pro | Eyebrow, dugmad, navigacija, brojevi, kategorije, labele. Obična slova (sentence case), 12–14px, razmak `0.02em`, težina 500. |

Pravila:

- **Bez kurziva.** Naglasak se pravi bojom (pijesak) ili težinom, ne nagibom.
- Velika slova samo za ime i naslove H1/H2. Sve oznake, dugmad i navigacija su običnim slovima.
- Brojevi (statistika, numeracija) koriste `tabular-nums`.
- Mono se nikad ne koristi za duge paragrafe.
- Arapski: Noto Kufi Arabic (naslovi) i IBM Plex Sans Arabic (tekst), bez razmaka između slova. Latinična imena ostaju u Archivo.

## 5. Raspored i oblici

- Kontejner `1480px`, gutter `clamp(20px, 4vw, 48px)`, razmak sekcija `clamp(88px, 10vw, 140px)`.
- Uglovi su **pravi** (0px). Jedini krug je pozadina logo znaka.
- Linije su tanke (1px), neutralne (`--line`). Pijesak samo na hover/fokus okviru i u ikonama.
- Bez sjenki na tamnoj podlozi: dubina dolazi od koraka površine i linija.
- Bez providnosti na tekstu i stranici; koriste se tri uloge teksta.
- Ikone: linijske, 1.5px, bez ispune, u pijesku (vidi Usluge).
- Pokret: kratak i miran, `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)`. Hover mijenja samo boju ili površinu: bez uvećanja, podizanja i `transition: all`. Ulazak sekcija: kratki fade i 12px. Poštovati `prefers-reduced-motion`.

## 6. Fotografija i renderi

- Glavni sadržaj su renderi i fotografije projekata. UI im se sklanja s puta.
- Tekst preko slike uvijek ide preko tamnog sloja (`.hero-shade`, `.project-shade`). U heroju tekst stoji lijevo, na strani nacrta, a kuća ostaje svijetla.
- Renderi projekata su u punoj boji. Crno-bijeli je samo portret.
- Portret je crno-bijeli, smiren, bez filtera u boji.

## 7. Glas

**Miran, precizan, konkretan. Prvo lice jednine. Kao da Fatih objašnjava crtež klijentu.**

| Radimo | Ne radimo |
|---|---|
| Konkretne činjenice: „više od deset izgrađenih projekata“ | Prazne fraze: „strast prema dizajnu“, „prostori koji imaju smisao“ |
| Kratke rečenice, glagoli | Superlative: „najbolji“, „vrhunski“, „jedinstven“ |
| Pojmove iz struke kad pomažu: izvedba, osnove, presjeci | Žargon radi žargona |
| Iskrenost: student, tehničar, praksa u birou | Predstavljanje kao velikog biroa |

Naslovi sekcija su izjave, a ne etikete. Npr. „Prvo sam naučio graditi“, a ne „O Fatihu“.

### Ključne poruke

1. **Prvo sam naučio graditi.** Tehničko iskustvo prije dizajna, pa crteži uzimaju u obzir izvedbu.
2. **Od skice do izvedbe.** Jedna osoba kroz koncept, tehničke crteže i rendere.
3. **Svaki detalj mora moći da se izvede.** Preciznost kao vrijednost, ne kao slogan.

### Jezici

Osnova je **bosanski**. Engleski, njemački, turski i arapski se usklađuju prema njemu (`src/i18n/messages/*.json`). Prevode na turski i arapski treba da pregleda izvorni govornik.

## 8. Provjera prije objave

- [ ] Samo jedan akcent (pijesak), bez novih boja i gradijenata
- [ ] Naslovi u Archivo raširenom, oznake u mono, tekst u Archivo
- [ ] Bez kurziva, oznake običnim slovima
- [ ] Bez `transition: all`, hover bez uvećanja i podizanja
- [ ] Pravi uglovi, linije 1px
- [ ] Tekst preko slike ima tamni sloj i čita se na mobitelu
- [ ] Novi tekst je konkretan i u prvom licu, na svih 5 jezika
- [ ] Radi i u RTL (arapski) prikazu
