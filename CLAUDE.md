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

**Статус:** проект ещё не создан. Если папки `site/` нет — реализовать по `memory-bank/implementation-plan.md`, начиная с этапа 0.
После реализации удалить эту строку и обновить разделы ниже по фактическому коду.

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
grep -rn "Заглушка" src/content   # что ещё не дописано
```
Node 24 LTS (`site/.nvmrc`), минимум 22; на Mac ставится через Homebrew (`node@24`).
Git уже настроен владельцем — `user.name`/`user.email` и глобальные настройки не менять.
`SITE_URL` (необязательно): `SITE_URL=https://example.com npm run build` или в `site/.env`.

## Контент (основная работа после запуска)
Новый кейс:
1. Создать `site/src/content/cases/<slug>.md` (slug — латиница через дефис, станет URL).
2. Картинки положить в `site/src/assets/cases/<slug>/`.
3. В frontmatter `cover: "../../assets/cases/<slug>/cover.png"` — путь относительно .md файла; при `cover` обязателен `coverAlt`.
4. `order` уникален; при вставке в середину перенумеровать соседние кейсы.
5. `npx astro check` → проверить в `npm run dev`.

- Схема полей кейса — `site/src/content.config.ts`.
- Правка текста и порядка секций — только в .md, компоненты не трогать.
- Скрыть кейс: `draft: true`; порядок на главной: `order`.
- `results`: до 4 пар `{ value, label }`, на карточке видны первые 3.
- Необязательные поля без данных (`role`, `duration`, `cover`) не заполнять — иначе пустышка попадёт в шапку кейса.
- Подпись к картинке в теле кейса — `title` в Markdown: `![alt](путь "Подпись")`.
- Имя, описание, контакты, ID Метрики: `site/src/config/site.ts`. `telegram` хранится без `@`.

## Стек: ограничения
- Только компоненты `.astro`; React/Vue/Svelte не добавлять.
- Стили — обычный CSS: переменные и база в `site/src/styles/global.css`, остальное — scoped `<style>` в компонентах. Без Tailwind/Sass/CSS Modules.
- Шрифт — локально через `@fontsource-variable/*` (выбран владельцем на этапе 2), без Google Fonts и внешних CDN.
- Зависимости: `astro`, `@astrojs/sitemap`, `@fontsource-variable/*`, dev — `@astrojs/check`, `typescript`. Новый пакет — только если без него требование не закрыть; ставить с точной версией (`save-exact` в `site/.npmrc`).

## Gotchas
- Astro 7: конфиг коллекций в `site/src/content.config.ts` с `glob()`-loader; `entry.id` вместо `entry.slug`; `render()` из `astro:content`; `z` из `astro/zod`.
- `sitemap.xml` и абсолютные `og:image` — только при заданном `SITE_URL`; без него сборка должна проходить чисто.
- Подписи к картинкам делает свой плагин `site/src/lib/rehype-figure.mjs` (`title` → `<figcaption>`), Astro сам этого не умеет.
- Метрика грузится только при заданном `metrikaId`; цель `case_open` отправляется при загрузке страницы кейса, не по клику.
- `@astrojs/check` и `typescript` должны быть в devDependencies — иначе `astro check` задаёт интерактивный вопрос и зависает.
- CV на сайте — копия. При обновлении PDF в корне заново скопировать в `site/public/cv.pdf`.

## Workflow
- Коммитить после каждого завершённого этапа и перед крупной переработкой текстов кейсов.
