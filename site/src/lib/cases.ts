// Выборка кейсов для главной и страниц кейсов.
import { getCollection, type CollectionEntry } from 'astro:content';

export type CaseEntry = CollectionEntry<'cases'>;

/** Опубликованные кейсы (без `draft: true`), по возрастанию `order`. */
export async function getPublishedCases(): Promise<CaseEntry[]> {
  const entries = await getCollection('cases', ({ data }) => !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Следующий опубликованный кейс после указанного; после последнего — первый.
 * Если опубликован только один кейс (или id не найден) — `undefined`.
 */
export async function getNextCase(id: string): Promise<CaseEntry | undefined> {
  const cases = await getPublishedCases();
  if (cases.length < 2) return undefined;
  const index = cases.findIndex((entry) => entry.id === id);
  if (index === -1) return undefined;
  return cases[(index + 1) % cases.length];
}
