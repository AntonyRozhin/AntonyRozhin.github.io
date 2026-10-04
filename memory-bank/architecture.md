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
