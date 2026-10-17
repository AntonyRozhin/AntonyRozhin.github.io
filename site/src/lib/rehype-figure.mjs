// Подписи к картинкам в Markdown: HAST-плагин для Sätteri (Markdown-движок Astro 7).
// Абзац, в котором только картинка с title, превращается в
// <figure><img><figcaption>title</figcaption></figure>. Картинка без title не меняется.
// Абзац из нескольких картинок, у каждой из которых есть title, — в ряд экранов:
// <div class="gallery"> с такими же <figure> внутри (в Markdown — картинки подряд, каждая на своей строке).
// Ровно две картинки — пара «было → стало»: между ними вставляется стрелка (.gallery-arrow).
// Обход дерева делает сам Sätteri: visit вызывается для каждого <p>.

const isBlankText = (node) => node.type === 'text' && node.value.trim() === '';

const toFigure = (img) => {
  // title уходит в подпись, чтобы не дублироваться всплывающей подсказкой
  const { title, ...properties } = img.properties ?? {};
  if (typeof title !== 'string' || title.trim() === '') return null;
  return {
    type: 'element',
    tagName: 'figure',
    properties: {},
    children: [
      { type: 'element', tagName: 'img', properties, children: [] },
      {
        type: 'element',
        tagName: 'figcaption',
        properties: {},
        children: [{ type: 'text', value: title }],
      },
    ],
  };
};

export default function rehypeFigure() {
  return {
    name: 'figure-captions',
    element: {
      filter: ['p'],
      visit(node, ctx) {
        const children = node.children.filter((child) => !isBlankText(child));
        if (children.length === 0) return;
        if (!children.every((child) => child.type === 'element' && child.tagName === 'img')) return;

        const figures = children.map(toFigure);
        if (figures.some((figure) => figure === null)) return;

        if (figures.length === 1) {
          ctx.replaceNode(node, figures[0]);
          return;
        }

        const isPair = figures.length === 2;
        const arrow = {
          type: 'element',
          tagName: 'span',
          properties: { className: ['gallery-arrow'], ariaHidden: 'true' },
          children: [{ type: 'text', value: '→' }],
        };
        ctx.replaceNode(node, {
          type: 'element',
          tagName: 'div',
          properties: { className: isPair ? ['gallery', 'gallery--pair'] : ['gallery'] },
          children: isPair ? [figures[0], arrow, figures[1]] : figures,
        });
      },
    },
  };
}
