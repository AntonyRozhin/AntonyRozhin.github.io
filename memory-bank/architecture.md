# Архитектура проекта

Актуальное устройство проекта: файлы, их назначение и связи. Дополняется после каждого этапа.

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
