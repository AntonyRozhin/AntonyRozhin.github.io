// Схема коллекции кейсов. Ошибка в frontmatter любого кейса останавливает сборку
// с указанием файла и поля.
import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const requiredText = (field: string) =>
  z.string({ error: `Поле «${field}» обязательно и должно быть строкой` }).min(1, `Поле «${field}» не должно быть пустым`);

// Кейсы лежат плоско в этой папке, поэтому относительный путь обложки считается от неё.
const casesDir = new URL('./content/cases/', import.meta.url);

/**
 * Проверка, что файл обложки существует. Без неё Astro падает с ImageNotFound,
 * не называя ни файл кейса, ни поле; так ошибка указывает на «cover» в нужном .md.
 */
const checkCoverExists = (value: unknown, ctx: { addIssue: (issue: { code: 'custom'; message: string }) => void }) => {
  if (typeof value === 'string' && !existsSync(new URL(value, casesDir))) {
    ctx.addIssue({ code: 'custom', message: `Файл обложки «${value}» не найден — путь указывается относительно .md файла` });
  }
  return value;
};

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: ({ image }) =>
    z
      .object({
        title: requiredText('title'),
        summary: requiredText('summary'),
        company: requiredText('company'),
        /** Год или период: «2025», «2022–2024» */
        year: requiredText('year'),
        role: z.string().min(1).optional(),
        duration: z.string().min(1).optional(),
        results: z
          .array(
            z.object({
              /** Короткая цифра: «+12%», «×2», «до −30%» */
              value: requiredText('results.value'),
              /** Что изменилось */
              label: requiredText('results.label'),
            }),
          )
          .max(4, 'В «results» не больше 4 элементов')
          .optional(),
        /** Путь к обложке относительно .md файла; файл должен существовать */
        cover: z.preprocess(checkCoverExists, image()).optional(),
        coverAlt: z.string().min(1).optional(),
        /** Порядок на главной, по возрастанию */
        order: z.number({ error: 'Поле «order» обязательно и должно быть числом' }),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.cover || data.coverAlt, {
        message: 'Если указан «cover», нужно заполнить «coverAlt»',
        path: ['coverAlt'],
      }),
});

export const collections = { cases };
