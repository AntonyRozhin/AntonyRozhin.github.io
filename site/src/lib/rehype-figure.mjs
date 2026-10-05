// Подписи к картинкам в Markdown: HAST-плагин для Sätteri (Markdown-движок Astro 7).
// Абзац, в котором только картинка с title, превращается в
// <figure><img><figcaption>title</figcaption></figure>. Картинка без title не меняется.
// Обход дерева делает сам Sätteri: visit вызывается для каждого <p>.

const isBlankText = (node) => node.type === 'text' && node.value.trim() === '';

export default function rehypeFigure() {
  return {
    name: 'figure-captions',
    element: {
      filter: ['p'],
      visit(node, ctx) {
        const children = node.children.filter((child) => !isBlankText(child));
        if (children.length !== 1) return;

        const [img] = children;
        if (img.type !== 'element' || img.tagName !== 'img') return;

        // title уходит в подпись, чтобы не дублироваться всплывающей подсказкой
        const { title, ...properties } = img.properties ?? {};
        if (typeof title !== 'string' || title.trim() === '') return;

        ctx.replaceNode(node, {
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
        });
      },
    },
  };
}
