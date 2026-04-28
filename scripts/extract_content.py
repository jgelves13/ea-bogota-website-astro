"""
Extracts ES and EN content from bilingual HTML files.
For each page, strips out navbar/footer and separates data-lang spans.
Outputs clean HTML for each locale.
"""
import re
import sys
from pathlib import Path

def extract_body(html: str) -> str:
    """Extract content between mobile-nav close and footer open."""
    # Find end of mobile nav
    mobile_end = html.find('</div>\n\n  <!-- ')
    if mobile_end == -1:
        # Try after </div> following mobile-nav
        parts = html.split('class="mobile-nav"')
        if len(parts) > 1:
            rest = parts[1]
            # Find the closing of mobile-nav section
            idx = 0
            depth = 0
            found_start = False
            for i, c in enumerate(rest):
                if rest[i:i+4] == '<div':
                    depth += 1
                    found_start = True
                elif rest[i:i+6] == '</div>':
                    if found_start:
                        depth -= 1
                        if depth <= 0:
                            idx = i + 6
                            break
            body_start = html.find('class="mobile-nav"') + len('class="mobile-nav"') + idx
        else:
            body_start = 0
    else:
        body_start = mobile_end + 6  # after </div>

    # Find footer
    footer_idx = html.find('<footer')
    if footer_idx == -1:
        footer_idx = len(html)

    return html[body_start:footer_idx].strip()


def strip_lang(html: str, keep_lang: str) -> str:
    """
    Remove data-lang spans for the OTHER language.
    Keep the content of data-lang spans for keep_lang but remove the wrapper span.
    """
    remove_lang = 'en' if keep_lang == 'es' else 'es'

    # Remove spans with the other language (inline spans)
    html = re.sub(
        rf'<span\s+data-lang="{remove_lang}"[^>]*>.*?</span>',
        '',
        html,
        flags=re.DOTALL
    )

    # Remove divs with the other language
    html = re.sub(
        rf'<div\s+data-lang="{remove_lang}"[^>]*>.*?</div>',
        '',
        html,
        flags=re.DOTALL
    )

    # Unwrap spans with keep_lang (remove the span tags but keep content)
    html = re.sub(
        rf'<span\s+data-lang="{keep_lang}"[^>]*>(.*?)</span>',
        r'\1',
        html,
        flags=re.DOTALL
    )

    # Unwrap divs with keep_lang
    html = re.sub(
        rf'<div\s+data-lang="{keep_lang}"[^>]*>(.*?)</div>',
        r'\1',
        html,
        flags=re.DOTALL
    )

    # Clean up empty lines and excessive whitespace
    html = re.sub(r'\n{3,}', '\n\n', html)
    html = re.sub(r'  +', ' ', html)
    # But preserve indentation
    lines = html.split('\n')
    cleaned = []
    for line in lines:
        # Don't collapse leading whitespace
        stripped = line.rstrip()
        if stripped:
            cleaned.append(stripped)
        elif cleaned and cleaned[-1]:
            cleaned.append('')
    return '\n'.join(cleaned)


def fix_links(html: str, locale: str) -> str:
    """Convert internal .html links to locale-prefixed paths."""
    pages = ['index', 'about-ea', 'about-us', 'team', 'events',
             'get-involved', 'opportunities', 'faq', 'resources']

    for page in pages:
        # href="page.html" -> href="/locale/page/"
        html = html.replace(f'href="{page}.html"', f'href="/{locale}/{page}/"')
        html = html.replace(f'href="{page}.html#', f'href="/{locale}/{page}/#')

    # Special case: recursos-espanol.html -> /locale/resources/
    html = html.replace('href="recursos-espanol.html"', f'href="/{locale}/resources/"')

    # Fix image paths: src="img/ -> src="/img/
    html = re.sub(r'src="img/', 'src="/img/', html)

    return html


def process_page(input_path: str, output_dir: str, page_name: str):
    html = Path(input_path).read_text(encoding='utf-8')
    body = extract_body(html)

    for locale in ['es', 'en']:
        content = strip_lang(body, locale)
        content = fix_links(content, locale)

        out_path = Path(output_dir) / locale / f'{page_name}.html'
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(content, encoding='utf-8')
        print(f"  Wrote {out_path} ({len(content)} bytes)")


if __name__ == '__main__':
    src = 'G:/Mon Drive/EA Bogot\u00e1/Website'
    out = 'C:/Users/joseg/Documents/ea-bogota-website-astro/scripts/extracted'

    pages = {
        'about-us': f'{src}/about-us.html',
        'team': f'{src}/team.html',
        'get-involved': f'{src}/get-involved.html',
        'faq': f'{src}/faq.html',
        'events': f'{src}/events.html',
        'opportunities': f'{src}/opportunities.html',
        'resources': f'{src}/resources.html',
        'recursos-espanol': f'{src}/recursos-espanol.html',
        'index': f'{src}/index.html',
        'about-ea': f'{src}/about-ea.html',
    }

    for name, path in pages.items():
        print(f"Processing {name}...")
        try:
            process_page(path, out, name)
        except Exception as e:
            print(f"  ERROR: {e}")
