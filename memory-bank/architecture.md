# Архитектура проекта

Актуальное устройство проекта: файлы, их назначение и связи. Дополняется после каждого этапа.

## Итоговая карта файлов (Этап 11)

Всё ниже — фактические пути относительно `Portfolio/`. Подробности по каждому файлу — в разделах этапов ниже.

| Файл | Назначение | Вход → выход |
|---|---|---|
| `.gitignore` | Исключения git для всего репозитория | — |
| `site/package.json`, `site/package-lock.json` | 5 зависимостей с точными версиями, скрипты `dev`/`build`/`preview` | — |
| `site/.nvmrc`, `site/.npmrc` | Node 24; `save-exact=true` | — |
| `site/astro.config.mjs` | `site` из `SITE_URL` (env или `site/.env`), sitemap при `SITE_URL`, Markdown-процессор `satteri` + `rehype-figure` | env → конфиг сборки |
| `site/tsconfig.json` | Строгий TypeScript Astro | — |
| `site/src/config/site.ts` | Общие данные: имя, роль, описание, контакты, CV, Метрика, SEO | → `Base`, `Hero`, `Footer`, страницы |
| `site/src/content.config.ts` | Схема коллекции `cases`, проверка обложки | `.md` → типизированные записи |
| `site/src/content/cases/<slug>.md` | 11 кейсов: frontmatter + тело | → коллекция |
| `site/src/lib/cases.ts` | `getPublishedCases()`, `getNextCase(id)` | коллекция → списки |
| `site/src/lib/rehype-figure.mjs` | HAST-плагин Sätteri: `<img title>` → `<figure>` + `<figcaption>` | дерево Markdown → дерево |
| `site/src/styles/global.css` | Шрифт Manrope, токены, сброс, база, фокус, reduced motion | → все страницы через `Base` |
| `site/src/layouts/Base.astro` | `<head>` (мета, OG, favicon, Метрика), слот `header`, `<main>`, `Footer` | `title`, `description`, `ogImage?`, `goalOnLoad?` |
| `site/src/components/ImagePlaceholder.astro` | Декоративная заглушка картинки | `label`, `ratio` |
| `site/src/components/ResultList.astro` | Метрики результатов | `results?`, `limit?`, `variant` |
| `site/src/components/Hero.astro` | Первый экран главной | `site` |
| `site/src/components/CaseCard.astro` | Карточка кейса (`data-case-card`) | `entry`, `eager` |
| `site/src/components/CaseList.astro` | Секция `#cases` + анимация появления | `getPublishedCases()` |
| `site/src/components/Footer.astro` | Футер всех страниц | `site` |
| `site/src/components/CaseHeader.astro` | Фиксированная шапка кейса | `entry` |
| `site/src/components/NextCase.astro` | «Следующий кейс» | `entry` (следующий) |
| `site/src/pages/index.astro` | Главная: `Hero` + `CaseList` | — |
| `site/src/pages/cases/[slug].astro` | Страница кейса: панель, шапка, тело, «Следующий кейс» | `getStaticPaths` |
| `site/src/pages/404.astro` | Страница «не найдено» | — |
| `site/public/cv.pdf` | Копия CV из корня | — |
| `site/public/favicon.svg`, `site/public/favicon.ico` | Иконка «АР» (SVG для страниц, ICO для PDF и старых клиентов) | — |
| `site/public/robots.txt` | Разрешение индексации | — |

Временная `src/pages/design-preview.astro` (этап 2) удалена. Картинок в `src/assets/` пока нет — папки `src/assets/cases/<slug>/` и `src/assets/profile/` создаются вместе с первыми картинками.

## Корень `Portfolio/`

```
Portfolio/
  .gitignore                          ← git-репозиторий один, в корне
  CLAUDE.md                           ← шпаргалка для агента
  memory-bank/                        ← документы проекта
  Рожин Антон. Product Manager.pdf    ← оригинал CV
  site/                               ← проект Astro
```

- **`.gitignore`** — исключает сборку и генерируемое (`dist/`, `.astro/`), зависимости (`node_modules/`), секреты (`.env`), мусор macOS (`.DS_Store`) и локальные разрешения Claude Code (`.claude/settings.local.json`). Действует на весь репозиторий, включая `site/`.
- **Git** инициализирован в корне, а не в `site/`: документы и код версионируются вместе, чтобы итерации текстов кейсов можно было откатывать вместе с вёрсткой.
- **CV** в корне — оригинал; сайт использует копию `site/public/cv.pdf` (см. ниже). При обновлении PDF копию нужно заменить вручную.

## Проект `site/` (Этап 1 — каркас)

```
site/
  .nvmrc               ← целевая версия Node
  .npmrc               ← точная запись версий
  .gitignore           ← от мастера Astro, дублирует корневой
  .vscode/             ← рекомендации редактора от мастера
  README.md            ← стандартный README мастера
  astro.config.mjs     ← конфиг Astro (пока пустой)
  package.json
  package-lock.json
  tsconfig.json
  public/
    cv.pdf
    favicon.svg        ← логотип Astro, заменяется в шаге 2.5
    favicon.ico        ← от мастера
  src/pages/
    index.astro        ← стартовая страница мастера, заменяется в этапах 2–5
```

### Конфигурационные файлы
- **`.nvmrc`** — `24`: целевая версия Node для `nvm`/`fnm`. Фактически работает и на 22.12+ (минимум Astro 7).
- **`.npmrc`** — `save-exact=true`: `npm install` записывает версии без `^`/`~`, чтобы проект собирался одинаково через год. Вместе с `package-lock.json` и установкой через `npm ci` даёт воспроизводимую сборку.
- **`package.json`** — скрипты `dev` / `build` / `preview` / `astro` (обёртки над CLI Astro), `engines.node >=22`, закрытый список зависимостей:
  - `astro` 7.3.5 — генератор; тянет за собой `sharp` (картинки), `zod` (схемы), `@astrojs/markdown-satteri` (Markdown-движок Sätteri);
  - `@astrojs/sitemap` 3.7.4 — пока не подключён; будет добавляться в `astro.config.mjs` только при заданном `SITE_URL` (этап 8);
  - dev: `@astrojs/check` 0.9.10 + `typescript` 6.0.3 — нужны для `npx astro check`; без них команда задаёт интерактивный вопрос и зависает. TypeScript ограничен 6.x требованием `@astrojs/check`.
  - `allowScripts.esbuild: true` — от мастера: разрешает установочный скрипт esbuild (сборщик внутри Vite).
- **`package-lock.json`** — точное дерево зависимостей; коммитится, установка — `npm ci`.
- **`tsconfig.json`** — наследует `astro/tsconfigs/strict` (строгий TypeScript), включает сгенерированные типы `.astro/types.d.ts` (типы коллекций появятся в этапе 3), исключает `dist`.
- **`astro.config.mjs`** — пока `defineConfig({})`: статический вывод по умолчанию. Дальше сюда добавятся `site` из `SITE_URL`, условный sitemap и `markdown.processor: satteri({ hastPlugins: [...] })` для подписей к картинкам.
- **`.vscode/`** — рекомендация расширения Astro и конфиг запуска dev-сервера из VS Code; на сборку не влияют.

### Статические файлы `public/`
Копируются в корень `dist/` без обработки.
- **`cv.pdf`** — копия CV, доступна по `/cv.pdf`; на неё будет ссылаться `site.cvPath`.
- **`favicon.svg`, `favicon.ico`** — заглушки мастера.

### Страницы
- **`src/pages/index.astro`** — стартовая страница мастера (`lang="en"`, заголовок «Astro»). Временная: в этапе 2 обернётся в `Base.astro`, в этапах 4–5 станет главной с hero и кейсами.

### Особенности Astro 7, влияющие на архитектуру
- Markdown рендерит **Sätteri** (не remark/rehype). Свои HAST-плагины передаются через `satteri({ hastPlugins })` в `markdown.processor`; формат дерева — hast, как в rehype.
- `compressHTML: 'jsx'` по умолчанию — пробелы между тегами в шаблонах обрезаются по правилам JSX.
- Rust-компилятор `.astro` не исправляет разметку: каждый не-void тег должен быть закрыт.

## Этап 2 — дизайн-токены, шрифт, общий layout

```
site/
  public/favicon.svg          ← иконка «АР» (favicon.ico удалён)
  src/
    styles/global.css         ← токены + сброс + база
    layouts/Base.astro        ← каркас всех страниц
    pages/index.astro         ← временная главная на Base
```

### `src/styles/global.css`
Единственная точка правды для внешнего вида. Подключается один раз — в `Base.astro`, поэтому действует на все страницы.
- **`@import "@fontsource-variable/manrope"`** — первой строкой (CSS требует `@import` в начале). Vite разрешает пакет из `node_modules`, копирует woff2 в `dist/_astro/` и переписывает пути — шрифт локальный, без CDN.
- **`:root` — дизайн-токены.** Все HEX-цвета есть только здесь (это проверяется тестом шага 2.1):
  - палитра: `--color-bg`, `--color-surface` (фон плейсхолдеров/карточек), `--color-text`, `--color-text-muted`, `--color-line`, `--color-accent` (`#2f4bdb`), `--color-on-accent`;
  - `--font-sans` — `"Manrope Variable"`, затем системные sans-serif;
  - шкала текста `--text-sm … --text-display` (крупные размеры через `clamp()` — плавно от мобильных к десктопу; `--text-display` — для имени, `--text-xl` — для цифр результатов);
  - отступы `--space-1 … --space-24`;
  - ширины: `--content-max` 1200px (контейнер), `--text-max` 700px (текстовая колонка кейса), `--media-max` 1100px (картинки в теле кейса), `--gutter` (боковые поля);
  - `--radius`, `--transition` — общие для карточек и ховеров.
  - Брейкпоинты (768 / 1024px) записаны комментарием: CSS-переменные в `@media` не работают.
- **Сброс** — `box-sizing`, нулевые отступы, картинки `max-width: 100%`.
- **База** — фон и шрифт `body`, `overflow-wrap: break-word` (защита от длинных русских слов на 360px), заголовки с `text-wrap: balance` и `hyphens: auto` (работает благодаря `lang="ru"`), ссылки в акцентном цвете.
- **`:focus-visible`** — заметная обводка акцентным цветом для ссылок и кнопок (доступность).
- **`prefers-reduced-motion: reduce`** — глушит все анимации и переходы, поэтому компонентам не нужно дублировать это условие.

Компоненты из следующих этапов используют только переменные отсюда, своих цветов не задают.

### `src/layouts/Base.astro`
Общий каркас каждой страницы.
- **Вход (пропсы):** `title`, `description` (обязательные); `ogImage?: ImageMetadata`, `goalOnLoad?: string` — объявлены, но пока не используются (этап 8: OG-теги и цель Метрики `case_open`).
- **Выход:** `<html lang="ru">`, `<head>` (charset, viewport, `<title>`, `meta description`, favicon), `<body>` → `<main><slot/></main>`. Футер добавится после `<main>` в этапе 4.
- Favicon подключён с номером версии `?v=2`, чтобы обойти кэш иконок браузера; при замене `favicon.svg` номер увеличивать.
- Импорт `global.css` здесь гарантирует, что стили и шрифт есть на любой странице, использующей `Base`.

### `public/favicon.svg`
SVG 64×64: скруглённый квадрат цвета акцента и белые буквы «АР» системным шрифтом (в SVG-иконке подключённые веб-шрифты не работают). Цвет продублирован HEX-значением — CSS-переменные внутри favicon недоступны; при смене акцента править и здесь.

### `src/pages/index.astro`
Временная главная на `Base` с текстом «Сайт в разработке». В этапе 3 станет временным списком кейсов, в этапах 4–5 — настоящей главной.

## Этап 3 — данные и контент

```
site/src/
  config/site.ts              ← общие данные сайта
  content.config.ts           ← схема коллекции cases
  content/cases/<slug>.md     ← 11 кейсов, один файл = один кейс
  lib/cases.ts                ← выборка и порядок кейсов
  pages/index.astro           ← временный список кейсов
```

Поток данных: `content/cases/*.md` → (схема `content.config.ts`) → `lib/cases.ts` → страницы/компоненты. Общие данные: `config/site.ts` → `Base`, `Hero`, `Footer` (этап 4+). Тексты живут только в `.md` и `site.ts`; компоненты их лишь отображают.

### `src/config/site.ts`
- Экспортирует интерфейс `SiteConfig` и объект `site: SiteConfig`. Обязательные поля (`name`, `role`, `about`, `city`, `email`, `telegram`, `linkedin`, `cvPath`, `seoDescription`) обязательны в типе — пропуск ловит `astro check`. Необязательные: `photo?: ImageMetadata` (импорт картинки из `src/assets/profile/`), `phone?`, `metrikaId?`.
- `telegram` — ник без `@`; `phone` — в человекочитаемом виде, `tel:`-ссылку компонент строит сам, оставляя цифры и `+`.
- Обычный TS-модуль, а не коллекция: данных мало, а типизация TS проще схемы.

### `src/content.config.ts`
- Коллекция `cases`: `glob({ pattern: '**/*.md', base: './src/content/cases' })`; `entry.id` = имя файла без `.md` = slug в URL.
- Схема (Требования 7.2): обязательные `title`, `summary`, `company`, `year` (непустые строки), `order` (число); необязательные `role`, `duration`, `results` (≤ 4 пар `{ value, label }`), `cover`, `coverAlt`; `draft` по умолчанию `false`. Правило `.refine`: при `cover` обязателен `coverAlt` (ошибка вешается на поле `coverAlt`).
- `requiredText(field)` — фабрика строкового поля с русскими сообщениями.
- `cover: z.preprocess(checkCoverExists, image())` — сначала проверка, что файл существует (относительно `src/content/cases/`, т. е. относительно `.md`), затем штатный `image()`, который превращает путь в `ImageMetadata` для `<Image />`. Без проверки Astro сообщал бы о битом пути без имени кейса.
- Ошибки схемы при сборке выглядят как `InvalidContentEntryDataError: cases → <slug> … <поле>: <сообщение>` с путём к `.md`.

### `src/content/cases/*.md`
- Один файл на кейс; frontmatter по схеме, тело — свободный Markdown (рендер в этапе 6 через `render()`).
- Заглушки — строка `[Заглушка: дописать]`, только в теле.
- Картинки кейса будут лежать в `src/assets/cases/<slug>/`, путь в `cover` — `../../assets/cases/<slug>/cover.png`.

### `src/lib/cases.ts`
- `type CaseEntry = CollectionEntry<'cases'>`.
- `getPublishedCases()` — `getCollection('cases', !draft)`, сортировка по `order` по возрастанию. Единственный источник списка кейсов: главная, `getStaticPaths` страниц кейсов и «Следующий кейс» используют его, поэтому `draft` и порядок работают везде одинаково.
- `getNextCase(id)` — следующий опубликованный кейс по кругу; `undefined`, если опубликован один кейс или `id` не найден (тогда блок «Следующий кейс» не выводится).

### `src/pages/index.astro`
Временно: `Base` с `title` = «{name} — {role}» и `description` = `site.seoDescription`, внутри — `<ol>` заголовков из `getPublishedCases()`. В этапе 4 добавится Hero, в этапе 5 список заменится на `CaseList`.

## Этап 4 — hero и футер

```
site/src/
  components/
    ImagePlaceholder.astro    ← заглушка вместо картинки
    Hero.astro                ← первый экран главной
    Footer.astro              ← футер всех страниц
  layouts/Base.astro          ← + Footer, flex-раскладка body
  pages/index.astro           ← Hero + временный список кейсов
```

### `src/components/ImagePlaceholder.astro`
- **Вход:** `label` (текст по центру), `ratio` (строка для CSS `aspect-ratio`, напр. `"4/5"`, `"16/10"`).
- **Выход:** `<div>` на всю ширину родителя с заданными пропорциями; фон — `--color-surface` + штриховка цветом `--color-line`; подпись в «пилюле» цвета фона. Пропорции задаются инлайн-стилем, т. к. зависят от пропса.
- Используется: `Hero` (фото, «Фото», 4/5); в этапе 5 — `CaseCard` (обложка, название компании, 16/10).

### `src/components/Hero.astro`
- **Данные:** только `site` (пропсов нет).
- Кнопки описаны массивом `links` (`label`, `href`, `goal`, `primary`) и рендерятся одним `map` — одинаковая разметка и атрибуты у всех трёх. CV — `site.cvPath`, Telegram — `https://t.me/${site.telegram}`.
- `data-goal` (`cv_click`, `linkedin_click`, `telegram_click`) — для делегированного обработчика Метрики в этапе 8.
- Фото: при `site.photo` — `<Image>` из `astro:assets` (адаптивные `widths`/`sizes`, `loading="eager"` — это первый экран, 4/5 через `object-fit: cover`); иначе `ImagePlaceholder`.
- Раскладка — CSS grid: одна колонка; с 1024px — `1fr | minmax(18rem, 25rem)`. Секция с `aria-labelledby` на `<h1>`.
- Кнопки — `min-height: 2.75rem` (≈44px, удобная цель касания); ховер основной кнопки затемняет акцент через `color-mix()` — без новых HEX.

### `src/components/Footer.astro`
- **Данные:** только `site`. Подключается в `Base.astro`, поэтому есть на всех страницах автоматически.
- `phoneHref` строится из `site.phone` удалением всего, кроме цифр и `+`; без `phone` пункт не выводится.
- Внешние ссылки (Telegram, LinkedIn) — новая вкладка + `rel="noopener noreferrer"`; у email/Telegram/LinkedIn — `data-goal`.
- Раскладка: grid в одну колонку; с 768px — «имя+город | контакты», © во всю ширину.

### `src/layouts/Base.astro` (изменения)
- После `<main>` выводится `<Footer />`.
- Scoped-стиль: `body` — flex-колонка, `main { flex: 1 }` — футер прижат к низу окна (важно для 404 и коротких страниц).

## Этап 5 — карточки кейсов

```
site/src/
  components/
    ResultList.astro          ← метрики результатов (card | header)
    CaseCard.astro            ← карточка кейса
    CaseList.astro            ← секция #cases
  pages/index.astro           ← Hero + CaseList
```

Поток: `getPublishedCases()` → `CaseList` → `CaseCard` (×N) → `ResultList` / `ImagePlaceholder` / `<Image>`.

### `src/components/ResultList.astro`
- **Вход:** `results?` (массив `{ value, label }` из frontmatter), `limit?`, `variant: 'card' | 'header'`.
- **Выход:** `<ul class="results card|header">` с `<li>` → `.value` (крупно, акцент, без переноса) + `.label` (мелко, приглушённо). При пустом списке — ничего, ни обёртки, ни отступа.
- Варианты различаются только размером цифр и промежутками. `card` — в карточке (лимит 3), `header` — в шапке кейса (этап 6, все до 4).
- Внешний отступ сверху задаёт родитель (`CaseCard` — через `:global(.results)`), чтобы компонент не тянул лишнее место туда, где он стоит вплотную.

### `src/components/CaseCard.astro`
- **Вход:** `entry: CaseEntry`, `eager: boolean`.
- **Выход:** `<article class="card" data-case-card>` → `.text` (h3>a, meta, summary, ResultList, «Посмотреть кейс →») + `.visual` (обложка или заглушка). Ссылка — `/cases/${entry.id}/`.
- Растянутая ссылка: единственный `<a>` в заголовке, его `::after` покрывает карточку целиком; на нём же рисуется фокус-обводка.
- Обложка: `<Image>` с `widths` 480–1280 и `sizes` (640px на десктопе, 100vw ниже), `loading` по `eager`, 16/10 + `object-fit: cover`. Без `cover` — `ImagePlaceholder` (`label` = компания, `ratio` = 16/10).
- Раскладка: grid в одну колонку, визуал сверху (`order: -1`); с 1024px — `1fr | 1.35fr` (визуал ≈57%), визуал справа.
- Ховер: подъём на 3px, тень, акцентная рамка и заголовок, лёгкий zoom обложки; всё через `transition`, глушится `prefers-reduced-motion` из `global.css`.
- Атрибут `data-case-card` — для автоматических проверок (подсчёт карточек в `dist/`).

### `src/components/CaseList.astro`
- Данные — `getPublishedCases()` (пропсов нет): порядок по `order`, `draft` скрыты.
- `<section id="cases">` — цель ссылки «← Все кейсы» (`/#cases`) со страниц кейсов; `scroll-margin-top` даёт небольшой отступ при переходе по якорю.
- Первой карточке `eager={true}` — её обложка может попасть в первый экран; остальные ленивые.

## Этап 6 — страница кейса

```
site/
  astro.config.mjs            ← + markdown.processor: satteri({ hastPlugins })
  src/
    pages/cases/[slug].astro  ← страница кейса
    components/
      CaseHeader.astro        ← фиксированная шапка
      NextCase.astro          ← «Следующий кейс»
    lib/rehype-figure.mjs     ← подписи к картинкам
    layouts/Base.astro        ← + слот header
```

Поток страницы кейса: `getPublishedCases()` → `getStaticPaths` (одна страница на кейс) → `render(entry)` (Markdown → HTML через Sätteri + `rehype-figure`) → `Base` [слот header: верхняя панель] → `CaseHeader` + `.prose > <Content/>` → `NextCase` (из `getNextCase`) → `Footer`.

### `src/pages/cases/[slug].astro`
- `getStaticPaths()` — по записи на каждый опубликованный кейс: `params.slug = entry.id`, `props.entry`. Черновики не попадают в список → страница не создаётся.
- `render(entry)` из `astro:content` даёт `<Content />` — тело Markdown. Порядок и набор секций полностью задаются `.md`.
- Верхняя панель: `<header slot="header">` → `<nav>` «← Все кейсы» (`/#cases`) и имя (`/`).
- `.prose` — стили Markdown-тела через `:global()` (HTML тела рендерится вне scoped-области компонента): текстовая колонка `--text-max`, `<figure>`/`<p>` с картинкой — `--media-max`, отступы между блоками, заголовки, списки, цитаты, `figcaption`.

### `src/components/CaseHeader.astro`
- **Вход:** `entry`. **Выход:** `<header class="case-header">` внутри `<article>`.
- `meta` = `[company, year, role, duration].filter(Boolean).join(' · ')` — пустые поля пропускаются, висящих разделителей нет.
- Единственный `<h1>` страницы — название кейса.
- `ResultList` без `limit` (все до 4), `variant="header"`.
- Обложка: `<Image>` (`widths` 640–2200, `sizes` до 1100px, `loading="eager"` — первый экран), без обрезки; без `cover` — `ImagePlaceholder` 16/9 с компанией.

### `src/components/NextCase.astro`
- **Вход:** `entry` — следующий кейс. Сам не решает, показываться ли: страница вызывает его только при непустом `getNextCase()` (при одном опубликованном кейсе блока нет).
- `<nav aria-label="Следующий кейс">` с одной ссылкой-плашкой: подпись, название, «компания · год», стрелка.

### `src/lib/rehype-figure.mjs`
- Экспортирует фабрику `rehypeFigure()` → определение HAST-плагина Sätteri `{ name, element: { filter: ['p'], visit } }`.
- `visit(p)`: если в абзаце (без пробельных текстов) ровно один `<img>` с непустым `title` — `ctx.replaceNode(p, figure)`, где `figure` = новый `<img>` (без `title`) + `<figcaption>` с текстом `title`. Иначе ничего не делает.
- Порядок плагинов в Astro: подсветка кода → пользовательские (`rehype-figure`) → `image-marker` (оптимизация картинок) → id заголовков. Поэтому картинка в `<figure>` оптимизируется как обычно.
- Имя файла с «rehype» сохранено по плану; по сути это HAST-плагин Sätteri (то же дерево hast).

### `astro.config.mjs`
- `markdown.processor: satteri({ hastPlugins: [rehypeFigure()] })` — замена процессора по умолчанию на такой же `satteri()`, но с нашим плагином. `satteri` импортируется из `@astrojs/markdown-satteri` (зависимость `astro`).

### `src/layouts/Base.astro` (изменения)
- `<slot name="header" />` перед `<main>` — для верхней панели страницы кейса; на главной не используется.

## Этап 7 — страница 404

```
site/src/pages/404.astro      ← страница «не найдено»
```

### `src/pages/404.astro`
- Astro собирает её в `dist/404.html`; статические хостинги (и `astro preview`) отдают этот файл для любого несуществующего адреса с кодом 404.
- В `Base`: title «Страница не найдена — {name}», короткое description; `<h1>` «Страница не найдена», ссылка-кнопка на `/`. Футер прижат к низу благодаря flex-раскладке `body` в `Base`.
- Данные — только `site.name`; текст страницы служебный, поэтому живёт в шаблоне, а не в `site.ts`.

### Проверенные свойства картинок (для будущих правок)
- `CaseCard`: обложка с `loading` по пропсу `eager` (только первая карточка — `eager`), `alt` = `coverAlt`, `width`/`height` и `srcset` проставляет `<Image>`, формат WebP.
- `CaseHeader`: обложка всегда `eager` (первый экран страницы кейса).
- Картинки в теле Markdown оптимизирует Astro (WebP, `loading="lazy"`); битый путь роняет сборку.

## Этап 8 — SEO и Яндекс Метрика

```
site/
  astro.config.mjs            ← site из SITE_URL, условный sitemap
  public/robots.txt           ← разрешение индексации
  src/layouts/Base.astro      ← OG-теги, Метрика
  src/pages/index.astro       ← ogImage = site.photo
  src/pages/cases/[slug].astro← ogImage = cover, goalOnLoad = case_open
```

### `astro.config.mjs`
- Если есть `site/.env` — `process.loadEnvFile()` загружает его в `process.env` (не перезаписывая уже заданные переменные).
- `site: process.env.SITE_URL || undefined`; `integrations: siteUrl ? [sitemap()] : []`. Без домена сборка не знает адреса сайта — sitemap и абсолютные ссылки не строятся, и это не ошибка.
- `@astrojs/sitemap` создаёт `sitemap-index.xml` + `sitemap-0.xml` со всеми страницами, кроме 404.

### `src/layouts/Base.astro` (SEO и аналитика)
- **OG:** `og:type`, `og:locale` (`ru_RU`), `og:site_name` (`site.name`), `og:title` = `title`, `og:description` = `description`. При `Astro.site`: `og:url` = `Astro.url.pathname` от `site`; при `ogImage` — `getImage({ width: 1200, format: 'jpeg' })` → абсолютный `og:image`.
- **Метрика** (только при `site.metrikaId`):
  - `<script is:inline define:vars={{ metrikaId, goalOnLoad }}>` — Astro оборачивает код в функцию с константами; скрипт не проходит через сборщик (официальный код как есть).
  - `ym(id, 'init', …)`; затем `reachGoal(goalOnLoad)`, если задан.
  - Делегированный `click` на `document`: `closest('[data-goal]')` → `reachGoal(<data-goal>)`. Новые цели добавляются просто атрибутом `data-goal` в разметке.
  - `<noscript>` с пикселем `mc.yandex.ru/watch/<id>` — в начале `<body>`.
- Атрибуты `data-goal` сейчас: Hero — `cv_click`, `linkedin_click`, `telegram_click`; Footer — `email_click`, `telegram_click`, `linkedin_click`. Страница кейса — `goalOnLoad="case_open"`.

### `public/robots.txt`
Разрешает индексацию всего сайта. При деплое добавить строку `Sitemap: <SITE_URL>/sitemap-index.xml`.

## Этап 9 — анимации и доступность

```
site/
  public/favicon.ico          ← иконка «АР» для PDF-просмотрщика и старых браузеров
  src/components/
    CaseList.astro            ← + обёртки data-reveal и скрипт появления
    ImagePlaceholder.astro    ← + aria-hidden
```

### `src/components/CaseList.astro` (появление при прокрутке)
- Разметка: `.list > .item[data-reveal] > CaseCard`.
- Инлайн-скрипт (`is:inline`, ~20 строк, единственный JS сайта кроме Метрики): выходит, если нет `IntersectionObserver` или включён `prefers-reduced-motion`; иначе ставит `html.js-reveal`, наблюдает за `[data-reveal]` (`rootMargin` −8% снизу), при пересечении добавляет `.is-visible` и прекращает наблюдение.
- CSS: `:global(html.js-reveal) .item` — `opacity: 0; translate: 0 1.5rem`; `.is-visible` — исходное состояние; переход 600ms. Без класса на `<html>` правил нет — контент виден всегда.
- `translate` (отдельное CSS-свойство), а не `transform`, и на обёртке, а не на карточке, — чтобы не пересекаться с ховер-эффектом `CaseCard`.

### `src/components/ImagePlaceholder.astro` (изменение)
- Корень с `aria-hidden="true"`: заглушка не озвучивается экранными чтецами (подпись — повтор компании или «Фото»).

### `public/favicon.ico`
- ICO с тремя PNG (16/32/48) — растровая копия `favicon.svg`. Нужен, потому что браузерный просмотр PDF (`/cv.pdf`) и некоторые клиенты запрашивают `/favicon.ico` напрямую, без `<link rel="icon">`. В `Base.astro` подключён только SVG.

## Этап 10 — устойчивость вёрстки

Изменения в существующих файлах (новых файлов нет):
- **`src/styles/global.css`** — `body { overflow-wrap: anywhere }`: длинные слова не только переносятся, но и не увеличивают минимальную ширину колонок. Вместе с `hyphens: auto` у заголовков (переносы по слогам для `lang="ru"`).
- **`CaseCard.astro`** — десктопная сетка `minmax(0, 1fr) minmax(0, 1.35fr)`.
- **`NextCase.astro`** — `minmax(0, 1fr) auto` (текст | стрелка).
- **`Footer.astro`** — с 768px `auto minmax(0, 1fr)`.
- **`Hero.astro`** — с 1024px `minmax(0, 1fr) minmax(18rem, 25rem)`.

Правило для новых сеток: гибкие колонки задавать как `minmax(0, Nfr)`, а не `Nfr`, — иначе колонка не сжимается уже самого длинного слова или картинки и может вызвать горизонтальный скролл.

## Реальные кейсы из `Cases/` (после этапа 11)

- **`Cases/`** (корень репозитория) — исходники текстов и схем от владельца: `01…05-*.md`, `schemes/*.png|svg`. Сайт их не читает; это рабочий материал, из которого переносится контент в `site/src/content/cases/`. Будущие картинки владелец кладёт в `Cases/images/<slug>/`.
- **`site/src/content/cases/*.md`** — пять опубликованных кейсов (order 1–5) с реальным текстом; шесть остальных скрыты `draft: true` (order 6–11) до появления текстов.
- **`site/src/assets/cases/<slug>/`** — картинки кейсов; сейчас две схемы (`credit-preapproved`, `credit-funnel`), подключены в теле через `![alt](путь "Подпись")`.
- **`site/src/pages/cases/[slug].astro`** — в `.prose` добавлены стили `table/th/td`: таблицы из Markdown прокручиваются внутри себя на узких экранах.

## Картинки кейсов, галереи и фото (18.10.2026)

- **`Cases/images/`** — исходные скриншоты владельца (`case_N.M.png`); сайт их не читает, копии с говорящими именами лежат в `site/src/assets/cases/<slug>/`.
- **`site/src/assets/cases/<slug>/cover.png`** — обложки, собранные из экранов (композиция 1600×1000); у `pump-predictive-ai` обложка — `dashboard.png`.
- **`site/src/assets/profile/photo.jpg`** — фото для hero, импортируется в `site/src/config/site.ts` (`photo`).
- **`site/src/lib/rehype-figure.mjs`** — теперь три случая: одна картинка с `title` → `<figure>`; несколько подряд → `<div class="gallery">` из `<figure>`; ровно две → `<div class="gallery gallery--pair">` + `<span class="gallery-arrow" aria-hidden="true">→</span>` между ними. В Markdown картинки галереи пишутся подряд, каждая на своей строке, без пустой строки между ними.
- **`site/src/pages/cases/[slug].astro`** — стили `.gallery` (flex с переносом, экраны 9,5–16rem, на 360px — по два в ряд) и `.gallery-arrow` (круг с обводкой, отрицательные поля — стрелка ложится на зазор между экранами).
