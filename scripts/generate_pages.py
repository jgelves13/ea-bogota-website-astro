"""
Generates .astro page files from extracted HTML content.
Wraps each extracted HTML file in a BaseLayout import.
"""
from pathlib import Path

EXTRACTED_DIR = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/scripts/extracted')
PAGES_DIR = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/src/pages')

# Page configs: name -> (title_es, title_en, currentPage, extra_imports)
PAGES = {
    'about-us': {
        'title_es': 'Sobre EA Bogota',
        'title_en': 'About EA Bogota',
        'currentPage': 'about-us',
    },
    'team': {
        'title_es': 'Equipo',
        'title_en': 'Our Team',
        'currentPage': 'team',
    },
    'get-involved': {
        'title_es': 'Pasa a la accion',
        'title_en': 'Take Action',
        'currentPage': 'get-involved',
    },
    'faq': {
        'title_es': 'Preguntas frecuentes',
        'title_en': 'FAQ',
        'currentPage': 'faq',
        'extra_script': 'faq',
    },
    'events': {
        'title_es': 'Eventos',
        'title_en': 'Events',
        'currentPage': 'events',
        'extra_css': 'events',
        'extra_script': 'events',
    },
    'opportunities': {
        'title_es': 'Tablero de oportunidades',
        'title_en': 'Opportunities Board',
        'currentPage': 'opportunities',
        'extra_css': 'opportunities',
        'extra_script': 'opportunities',
    },
}

def generate_page(name: str, config: dict, locale: str):
    title = config.get(f'title_{locale}', config.get('title_es', name))
    current_page = config.get('currentPage', name)

    # Read extracted content
    content_file = EXTRACTED_DIR / locale / f'{name}.html'
    if not content_file.exists():
        print(f"  SKIP: {content_file} not found")
        return
    content = content_file.read_text(encoding='utf-8')

    # Build frontmatter imports
    imports = ["import BaseLayout from '../../layouts/BaseLayout.astro';"]

    if config.get('extra_css') == 'events':
        imports.append("import '../../styles/events.css';")
    elif config.get('extra_css') == 'opportunities':
        imports.append("import '../../styles/opportunities.css';")

    frontmatter = '---\n' + '\n'.join(imports) + '\n---\n\n'

    # Build page
    page = frontmatter
    page += f'<BaseLayout locale="{locale}" title="{title}" currentPage="{current_page}">\n'
    page += content + '\n'

    # Add page-specific scripts
    if config.get('extra_script') == 'faq':
        page += '<script src="../../scripts/faq.js"></script>\n'
    elif config.get('extra_script') == 'events':
        page += '<script src="../../scripts/events.js"></script>\n'
    elif config.get('extra_script') == 'opportunities':
        page += '<script src="../../scripts/opportunities.js"></script>\n'

    page += '</BaseLayout>\n'

    # Write
    out_path = PAGES_DIR / locale / f'{name}.astro'
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding='utf-8')
    print(f"  Wrote {out_path}")


if __name__ == '__main__':
    for name, config in PAGES.items():
        print(f"Generating {name}...")
        for locale in ['es', 'en']:
            generate_page(name, config, locale)
