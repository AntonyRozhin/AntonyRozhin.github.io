// Общие данные сайта: имя, описание, контакты, ID Метрики.
// Компоненты берут эти значения отсюда — в вёрстке их не дублировать.
import type { ImageMetadata } from 'astro';
import photo from '../assets/profile/photo.jpg';
import avatar from '../assets/profile/avatar.jpg';

export interface SiteConfig {
  /** Имя и фамилия */
  name: string;
  /** Роль для hero */
  role: string;
  /** 2–4 предложения о себе для hero */
  about: string;
  /** Портрет из src/assets/profile/ (импорт картинки); og:image главной */
  photo?: ImageMetadata;
  /** Квадратный кадр по плечи для круглого аватара в hero; без него берётся photo */
  avatar?: ImageMetadata;
  city: string;
  email: string;
  /** В человекочитаемом виде; для tel: оставляются только цифры и + */
  phone?: string;
  /** Ник без @ */
  telegram: string;
  /** Полный URL профиля */
  linkedin: string;
  /** Путь к CV в public/ */
  cvPath: string;
  /** ID счётчика Яндекс Метрики; без него Метрика не подключается */
  metrikaId?: string;
  /** Описание для meta / OG главной */
  seoDescription: string;
  /** Опыт для hero: новые места сверху, 2–4 строки, без цифр результатов */
  experience: { company: string; years: string; role: string }[];
}

export const site: SiteConfig = {
  name: 'Антон Рожин',
  role: 'Product Manager',
  about:
    'Product Manager с консалтинговым бэкграундом и 3+ годами опыта в продуктовом управлении. Запустил 2 продукта в FinTech и 3 продукта с нуля в EnergyTech. Принимаю решения на основе данных.',
  photo,
  avatar,
  city: 'Санкт-Петербург',
  email: 'rozhin96@mail.ru',
  phone: '+7 (953) 156-71-67',
  telegram: 'AntonyRozhin',
  linkedin: 'https://www.linkedin.com/in/AntonyRozhin',
  cvPath: '/cv.pdf',
  seoDescription:
    'Антон Рожин — Product Manager. Кейсы в FinTech и EnergyTech с измеримыми результатами.',
  experience: [
    { company: 'Банк Санкт-Петербург', years: '2025 — сейчас', role: 'Product Manager · карты, кредиты, вклады, страховки' },
    { company: 'Газпромнефть НТЦ', years: '2022 — 2025', role: 'Product Manager · продукты для разведки и добычи' },
    { company: 'Команда развития стартапов', years: '2022 — 2024', role: 'Business Analyst · бизнес-модели SaaS, BaaS, e\u2011commerce' },
  ],
};
