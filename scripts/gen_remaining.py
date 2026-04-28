from pathlib import Path

ext = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/scripts/extracted')
pages = Path('C:/Users/joseg/Documents/ea-bogota-website-astro/src/pages')

# Homepage ES
es_idx = (ext / 'es' / 'index.html').read_text(encoding='utf-8')
es_idx_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="es" currentPage="index">
""" + es_idx + '\n</BaseLayout>\n'
(pages / 'es' / 'index.astro').write_text(es_idx_page, encoding='utf-8')
print("Wrote es/index.astro")

# Homepage EN
en_idx = (ext / 'en' / 'index.html').read_text(encoding='utf-8')
en_idx_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="en" title="Effective Altruism Bogota" currentPage="index">
""" + en_idx + '\n</BaseLayout>\n'
(pages / 'en' / 'index.astro').write_text(en_idx_page, encoding='utf-8')
print("Wrote en/index.astro")

# Essay ES
es_essay = (ext / 'es' / 'about-ea.html').read_text(encoding='utf-8')
es_essay_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="es" title="Que es el Altruismo Eficaz?" currentPage="about-ea">
""" + es_essay + """
<script src="../../scripts/essay.js"></script>
</BaseLayout>
"""
(pages / 'es' / 'about-ea.astro').write_text(es_essay_page, encoding='utf-8')
print("Wrote es/about-ea.astro")

# Essay EN
en_essay = (ext / 'en' / 'about-ea.html').read_text(encoding='utf-8')
en_essay_page = """---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout locale="en" title="What is Effective Altruism?" currentPage="about-ea">
""" + en_essay + """
<script src="../../scripts/essay.js"></script>
</BaseLayout>
"""
(pages / 'en' / 'about-ea.astro').write_text(en_essay_page, encoding='utf-8')
print("Wrote en/about-ea.astro")
