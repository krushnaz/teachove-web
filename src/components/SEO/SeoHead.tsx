import { useEffect } from 'react';

const SITE_URL = 'https://teachove.com';
const DEFAULT_TITLE = 'TeachoVE | School ERP & School Management Software India';
const DEFAULT_DESCRIPTION =
  'TeachoVE is an online School ERP system for India — student management, attendance, fee management, teacher management, and school administration in one cloud-based school management app.';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = 'teachove-json-ld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export const landingPageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TeachoVE',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-97661-17311',
      contactType: 'sales',
      email: 'vedanteducation.22@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://play.google.com/store/apps/details?id=com.sms.my_school',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TeachoVE School ERP',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free trial available',
    },
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    downloadUrl:
      'https://play.google.com/store/apps/details?id=com.sms.my_school',
    featureList: [
      'Student Management Software',
      'Attendance Management System',
      'Fee Management Software',
      'Teacher Management Software',
      'School Administration Software',
      'Online School ERP',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TeachoVE',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
];

export function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = SITE_URL,
  noindex = false,
  ogImage = `${SITE_URL}/icon-512.png`,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    upsertMeta('description', description);
    upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', canonical);

    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:url', canonical, 'property');
    upsertMeta('og:image', ogImage, 'property');
    upsertMeta('og:site_name', 'TeachoVE', 'property');
    upsertMeta('og:locale', 'en_IN', 'property');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', ogImage);

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    }

    return () => {
      const jsonEl = document.getElementById('teachove-json-ld');
      jsonEl?.remove();
    };
  }, [title, description, canonical, noindex, ogImage, jsonLd]);

  return null;
}

export { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION };
