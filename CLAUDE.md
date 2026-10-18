# Portfolio — сайт-портфолио PM (Astro 7, статика)

## ВАЖНО
- **ВСЕГДА** читай @memory-bank/tech-stack.md перед написанием любого кода.
- **ВСЕГДА** читай @memory-bank/portfolio-site-requirements-document.md перед написанием любого кода.
- Реализация идёт строго по `memory-bank/implementation-plan.md`, начиная с первого невыполненного шага (`- [ ]`). **В плане разрешено только ставить галочку `- [x]` у выполненного шага** — текст плана не менять.
- **После каждого этапа — СТОП.** Отчитайся, перечисли визуальные тесты для проверки и жди. Следующий этап не начинать, пока владелец не проверил и не подтвердил текущий.
- После подтверждения этапа владельцем: открой `memory-bank/progress.md` и задокументируй сделанное для будущих разработчиков, затем **добавь** архитектурные пояснения в @memory-bank/architecture.md — что делает каждый файл. Затем коммит.
- Визуальные проверки делает владелец в браузере или просит выполнить через Playwright. Playwright без просьбы владельца не запускать.

## Memory bank (`memory-bank/`)
- `portfolio-site-requirements-document.md` — полные требования к сайту.
- `tech-stack.md` — стек, его обоснование и ограничения.
- `architecture.md` — актуальное устройство проекта: файлы, компоненты, их назначение и связи.
- `implementation-plan.md` — пошаговый план реализации с тестом для каждого шага.
- `progress.md` — журнал выполненных этапов и текущий статус.

Язык сайта и контента — русский.

## Расположение
- Проект Astro — в `site/`. Все npm-команды запускать оттуда.
- В корне: CV (`Рожин Антон. Product Manager.pdf`), папка `memory-bank/`, этот файл — не удалять и не перемещать. На сайте используется копия: `site/public/cv.pdf`.

## Команды (из `site/`)
```bash
npm ci            # установка по lockfile (первое создание проекта — npm install)
npm run dev       # http://localhost:4321
npm run build     # → dist/; падает, если frontmatter кейса невалиден
npm run preview
npx astro check   # типы и схема контента
npx astro dev stop   # если dev-сервер не видит новые .md или content.config.ts — остановить и запустить заново
grep -rn "Заглушка" src/content   # что ещё не дописано
```
Node 24 LTS (`site/.nvmrc`), минимум 22.12 (требование Astro 7); на Mac ставится через Homebrew (`node@24`).
Git уже настроен владельцем — `user.name`/`user.email` и глобальные настройки не менять.
`SITE_URL` (необязательно): `SITE_URL=https://example.com npm run build` или строкой `SITE_URL=…` в `site/.env` (читается `process.loadEnvFile` в `astro.config.mjs`).
Lighthouse: `npm run build && npx astro preview --port 4322`, затем `npx lighthouse http://localhost:4322/` (порт 4321 обычно занят dev-сервером).

## Контент (основная работа после запуска)
Новый кейс:
1. Создать `site/src/content/cases/<slug>.md` (slug — латиница через дефис, станет URL).
2. Картинки положить в `site/src/assets/cases/<slug>/`.
3. В frontmatter `cover: "../../assets/cases/<slug>/cover.png"` — путь относительно .md файла; при `cover` обязателен `coverAlt`. Обложку готовить шириной ~1600–2200px: `<Image>` не увеличивает картинку.
4. `order` уникален; при вставке в середину перенумеровать соседние кейсы.
5. `npx astro check` → проверить в `npm run dev`.

- Схема полей кейса — `site/src/content.config.ts`.
- Правка текста и порядка секций — только в .md, компоненты не трогать.
- Скрыть кейс: `draft: true`; порядок на главной: `order`.
- `results`: **ровно 2 пары** `{ value, label }` у каждого опубликованного кейса — на карточке они стоят в одну строку (схема допускает до 4, но карточка показывает первые 2). `value` — короткое и однозначное: `−20%`, а не `−15–20%`.
- Необязательные поля без данных (`role`, `duration`, `cover`) не заполнять — иначе пустышка попадёт в шапку кейса.
- Подпись к картинке в теле кейса — `title` в Markdown: `![alt](путь "Подпись")`.
- Имя, описание, контакты, ID Метрики, опыт для hero (`experience`: компания, годы, роль; новые сверху, без цифр): `site/src/config/site.ts`. `telegram` хранится без `@`.

## Стек: ограничения
- Только компоненты `.astro`; React/Vue/Svelte не добавлять.
- Стили — обычный CSS: переменные и база в `site/src/styles/global.css`, остальное — scoped `<style>` в компонентах. Без Tailwind/Sass/CSS Modules.
- Шрифт — Manrope, локально через `@fontsource-variable/manrope` (`@import` в `global.css`), без Google Fonts и внешних CDN.
- Палитра — монохром + лаймовый маркер (с 18.10.2026): чернила `#111111` (`--color-text` = `--color-accent`), фон `#FAFAF8`, маркер `--color-mark: #E4F59B`, подложка обложек `--color-cover: #E8E8E2`. Текст цветом не выделять — только размер, вес и маркер **фоном** под чернилами (полоса под цифрами результатов, ховеры). Маркером не обводить фото.
- Цвета — только CSS-переменные в `:root` `global.css`; производные оттенки — через `color-mix()`, новых HEX в компонентах нет.
- Гибкие колонки сеток — `minmax(0, Nfr)`, не `Nfr`: иначе длинное слово распирает колонку.
- Зависимости: `astro`, `@astrojs/sitemap`, `@fontsource-variable/manrope`, dev — `@astrojs/check`, `typescript` (≤ 6.x — ограничение `@astrojs/check`). Новый пакет — только если без него требование не закрыть; ставить с точной версией (`save-exact` в `site/.npmrc`).

## Gotchas
- Astro 7: конфиг коллекций в `site/src/content.config.ts` с `glob()`-loader; `entry.id` вместо `entry.slug`; `render()` из `astro:content`; `z` из `astro/zod`.
- `sitemap-index.xml` + `sitemap-0.xml` и абсолютные `og:url`/`og:image` — только при заданном `SITE_URL`; без него сборка проходит чисто. При деплое добавить в `public/robots.txt` строку `Sitemap: <SITE_URL>/sitemap-index.xml`.
- Деплой: GitHub Pages, репозиторий `AntonyRozhin.github.io` (публичный), workflow `.github/workflows/deploy.yml` собирает `site/` при push в `master` с `SITE_URL=https://antonyrozhin.github.io`. Ссылки на сайте от корня (`/cv.pdf`, `/cases/…`) — работают только потому, что сайт на корне домена; при смене адреса на `…/<repo>/` понадобится `base`. При смене домена поправить `SITE_URL` в workflow и строку `Sitemap` в `robots.txt`.
- Markdown в Astro 7 рендерит **Sätteri**, не remark/rehype: `markdown.rehypePlugins` не работают. Подписи к картинкам делает свой HAST-плагин Sätteri `site/src/lib/rehype-figure.mjs` (`title` → `<figcaption>`), подключён через `satteri({ hastPlugins })` из `@astrojs/markdown-satteri` в `astro.config.mjs`. Дерево меняется только через `ctx.replaceNode` и т. п., не прямой мутацией.
- `compressHTML: 'jsx'` (по умолчанию в Astro 7) режет пробелы между элементами/выражениями — строки вида «компания · год» собирать шаблонной строкой. Rust-компилятор требует закрывающие теги; комментарии в шаблонах — `{/* */}`.
- Битый путь `cover` ловит своя проверка в `content.config.ts` (`checkCoverExists`) — ошибка с именем кейса и поля. Схема считает путь от `src/content/cases/`, поэтому кейсы — плоско, без подпапок.
- Инлайн-скрипты (`is:inline`) попадают в HTML как есть — комментарии писать снаружи.
- Метрика грузится только при заданном `metrikaId`; цель `case_open` отправляется при загрузке страницы кейса, не по клику.
- `@astrojs/check` и `typescript` должны быть в devDependencies — иначе `astro check` задаёт интерактивный вопрос и зависает.
- CV на сайте — копия. При обновлении PDF в корне заново скопировать в `site/public/cv.pdf`.
- Обложки `cover.png` — экраны на подложке `#E8E8E2`, равные поля сверху и снизу, обрезанные снизу экраны растворяются в фон; светло-голубые фоны внутри экранов не перекрашивать. Исходные обложки на голубом `#F2F5F9` лежат рядом как `cover.original.png` (сайт их не импортирует). Новую обложку собирать сразу на `#E8E8E2`.
- Аватар в hero — квадратный кадр `src/assets/profile/avatar.jpg` (`avatar` в `site.ts`); `photo.jpg` остаётся для `og:image`.
- Favicon: `public/favicon.svg` подключён как `/favicon.svg?v=3` (обход кэша браузера); `public/favicon.ico` — растровая копия для просмотра PDF. При смене иконки обновить оба файла и поднять `v`.

## Workflow
- Коммитить после каждого завершённого этапа и перед крупной переработкой текстов кейсов.
