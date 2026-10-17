// Общие данные сайта: имя, описание, контакты, ID Метрики.
// Компоненты берут эти значения отсюда — в вёрстке их не дублировать.
import type { ImageMetadata } from 'astro';
import photo from '../assets/profile/photo.jpg';

export interface SiteConfig {
  /** Имя и фамилия */
  name: string;
  /** Роль для hero */
  role: string;
  /** 2–4 предложения о себе для hero */
  about: string;
  /** Портрет из src/assets/profile/ (импорт картинки); без него — плейсхолдер */
  photo?: ImageMetadata;
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
}

export const site: SiteConfig = {
  name: 'Антон Рожин',
  role: 'Product Manager',
  about:
    'Product Manager с консалтинговым бэкграундом и 3+ годами опыта в продуктовом управлении. Запустил 2 продукта в FinTech и 3 продукта с нуля в EnergyTech, принеся 300+ млн ₽. Принимаю решения на основе данных.',
  photo,
  city: 'Санкт-Петербург',
  email: 'rozhin96@mail.ru',
  phone: '+7 (953) 156-71-67',
  telegram: 'AntonyRozhin',
  linkedin: 'https://www.linkedin.com/in/AntonyRozhin',
  cvPath: '/cv.pdf',
  seoDescription:
    'Антон Рожин — Product Manager. Кейсы в FinTech и EnergyTech с измеримыми результатами.',
};
