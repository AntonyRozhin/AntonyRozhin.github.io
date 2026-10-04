# Журнал выполнения

Записи — по этапам `implementation-plan.md`, новые снизу.

---

## Этап 0. Подготовка окружения — 04.10.2026

**Сделано**
- Node и npm: используется уже установленный Node **22.17.0** (npm 10.9.2). План допускает 22.x, если он уже стоит, поэтому `node@24` через Homebrew не ставился. `site/.nvmrc` всё равно указывает `24` — это целевая версия.
- В корне `Portfolio/` создан git-репозиторий и `.gitignore` (`node_modules/`, `dist/`, `.astro/`, `.env`, `.DS_Store`). Настройки автора git не менялись.
- Первый коммит: «Этап 0: исходные документы».

---

## Этап 1. Каркас проекта Astro — 04.10.2026

**Сделано**
- Проект создан мастером `npm create astro@latest site -- --template minimal --no-install --no-git --yes`. TypeScript — `astro/tsconfigs/strict` (мастер ставит его по умолчанию).
- `site/.nvmrc` = `24`, `site/.npmrc` = `save-exact=true`, в `package.json` — `"engines": { "node": ">=22" }`.
- Зависимости (точные версии):
  - `dependencies`: `astro` **7.3.5**, `@astrojs/sitemap` 3.7.4;
  - `devDependencies`: `@astrojs/check` 0.9.10, `typescript` **6.0.3**.
- CV скопирован в `site/public/cv.pdf` (оригинал в корне на месте).
- В корневой `.gitignore` добавлен `.claude/settings.local.json` — локальные разрешения Claude Code не коммитятся.

**Решения и отклонения от плана**
- **Astro 7 вместо 6.** Сначала был закреплён Astro 6.4.8 по плану, но `npm audit` показал в Astro ≤ 7.2.7 критические уязвимости (XSS, RCE при оптимизации AVIF), исправленные только в 7.x. По решению владельца проект переведён на Astro 7.3.5; в требованиях, `tech-stack.md` и `CLAUDE.md` заменён только номер версии. Текст `implementation-plan.md` (упоминания «Astro 6» в шагах 1.1, 1.3, 3.2) по правилам не менялся — читать его как «Astro 7». После перехода `npm audit` — 0 уязвимостей.
- **TypeScript 6.0.3, не 7.x.** `@astrojs/check` 0.9.10 поддерживает только TypeScript `^5 || ^6`.
- **Удалены `site/AGENTS.md` и `site/CLAUDE.md`** (симлинк), созданные мастером: в них советы про React/Tailwind, противоречащие стеку, и они перекрывали бы корневой `CLAUDE.md`.
- `npm ls` помечает `@img/sharp-wasm32` как extraneous — это необязательный запасной бинарник `sharp` из lockfile, на работу не влияет.

**Важно для следующих этапов (Astro 7)**
- Markdown в Astro 7 обрабатывает **Sätteri**, а не remark/rehype. `markdown.rehypePlugins` без пакета `@astrojs/markdown-remark` не работают. Плагин подписей (`src/lib/rehype-figure.mjs`, шаг 6.5) нужно писать как **HAST-плагин Sätteri**: объект `{ name, element(node, ctx) { ... ctx.replaceNode(...) } }` — дерево то же, что в rehype (hast), импорты не нужны. Подключение: `markdown: { processor: satteri({ hastPlugins: [figure] }) }`, где `satteri` — из `@astrojs/markdown-satteri` (зависимость самого `astro`). Пользовательские HAST-плагины выполняются до встроенного плагина картинок Astro, поэтому `<img>` нужно оставлять нетронутым, только оборачивать.
- `compressHTML` по умолчанию теперь `'jsx'` — пробелы между инлайн-элементами в `.astro` вырезаются как в JSX; учитывать при вёрстке (например, «компания · год»).
- Компилятор на Rust требует закрывающих тегов у всех не-void элементов.

**Как проверить**
```bash
cd site
npm ci
npx astro check     # 0 errors, 0 warnings
npm run build       # без предупреждений
npm run dev         # http://localhost:4321 — стартовая страница, /cv.pdf — CV
```
