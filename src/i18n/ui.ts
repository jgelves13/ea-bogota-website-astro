export const ui = {
  es: {
    'site.title': 'Altruismo Eficaz Bogotá',
    'site.description': 'Comunidad de Altruismo Eficaz en Bogotá. Combinamos compasión y razón para hacer el mayor bien posible.',
    'nav.learn': 'Aprende',
    'nav.take-action': 'Actúa',
    'nav.events': 'Eventos',
    'nav.opportunities': 'Oportunidades',
    'nav.team': 'Equipo',
    'nav.conferences': 'Conferencias',
    'nav.home': 'Inicio',
    'nav.intro-essay': 'Ensayo introductorio',
    'nav.faq': 'Preguntas frecuentes',
    'nav.resources-es': 'Recursos en español',
    'nav.resources-all': 'Videos, libros, podcasts',
    'nav.online-course': 'Curso introductorio online',
    'nav.community-stories': 'Historias de la comunidad',
    'nav.newsletter': 'Newsletter de EA',
    'nav.handbook': 'Manual de EA',
    'nav.forum': 'Foro de EA',
    'footer.tagline': 'Comunidad de Altruismo Eficaz en Bogotá, Colombia. Combinamos compasión y razón para hacer el mayor bien posible.',
    'footer.take-action': 'Actúa',
    'footer.action-link': 'Pasa a la acción',
    'footer.events': 'Eventos',
    'footer.opportunities': 'Oportunidades',
    'footer.volunteer': 'Voluntariado',
    'footer.about': 'Acerca de',
    'footer.learn-ea': 'Aprende sobre AE',
    'footer.team': 'Equipo',
    'footer.resources': 'Recursos',
    'footer.reading': 'Lecturas',
    'footer.careers': 'Carreras',
    'footer.giving': 'Donaciones efectivas',
  },
  en: {
    'site.title': 'Effective Altruism Bogotá',
    'site.description': 'Effective Altruism community in Bogotá, Colombia. Combining compassion and reason to do the most good.',
    'nav.learn': 'Learn',
    'nav.take-action': 'Take action',
    'nav.events': 'Events',
    'nav.opportunities': 'Opportunities',
    'nav.team': 'Team',
    'nav.conferences': 'Conferences',
    'nav.home': 'Home',
    'nav.intro-essay': 'Intro essay',
    'nav.faq': 'FAQs',
    'nav.resources-es': 'Spanish resources',
    'nav.resources-all': 'Videos, books, podcasts',
    'nav.online-course': 'Online intro course',
    'nav.community-stories': 'Community stories',
    'nav.newsletter': 'EA Newsletter',
    'nav.handbook': 'EA Handbook',
    'nav.forum': 'EA Forum',
    'footer.tagline': 'Effective Altruism community in Bogotá, Colombia. Combining compassion and reason to do the most good.',
    'footer.take-action': 'Take action',
    'footer.action-link': 'Take action',
    'footer.events': 'Events',
    'footer.opportunities': 'Opportunities',
    'footer.volunteer': 'Volunteer',
    'footer.about': 'About',
    'footer.learn-ea': 'Learn about EA',
    'footer.team': 'Team',
    'footer.resources': 'Resources',
    'footer.reading': 'Reading List',
    'footer.careers': 'Careers',
    'footer.giving': 'Effective Giving',
  },
} as const;

export type Locale = keyof typeof ui;

export function t(locale: Locale, key: keyof typeof ui.es): string {
  return ui[locale][key] || ui.es[key];
}

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path.startsWith('/') ? path : '/' + path}`;
}

export function altLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}
