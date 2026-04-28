from pathlib import Path

ext = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/scripts/extracted')
pages = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/src/pages')

# ES: main resources + recursos-espanol appended
es_main = (ext / 'es' / 'resources.html').read_text(encoding='utf-8')
es_extra = (ext / 'es' / 'recursos-espanol.html').read_text(encoding='utf-8')
# Remove duplicate page-header from extra
es_extra_body = es_extra.split('</section>', 1)[-1] if '</section>' in es_extra else es_extra

es_content = es_main + '\n\n<!-- Recursos en espanol -->\n' + es_extra_body

es_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="es" title="Recursos" currentPage="resources">
""" + es_content + '\n</BaseLayout>\n'

(pages / 'es' / 'resources.astro').write_text(es_page, encoding='utf-8')
print("Wrote es/resources.astro")

# EN: just the EN resources
en_content = (ext / 'en' / 'resources.html').read_text(encoding='utf-8')
en_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="en" title="Resources" currentPage="resources">
""" + en_content + '\n</BaseLayout>\n'

(pages / 'en' / 'resources.astro').write_text(en_page, encoding='utf-8')
print("Wrote en/resources.astro")
