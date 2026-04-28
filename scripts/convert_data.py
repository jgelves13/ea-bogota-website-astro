"""Convert JS data files (EVENTS_DATA, OPPORTUNITIES_DATA) to JSON."""
import json
import re
from pathlib import Path

def js_to_json(js_content: str) -> str:
    """Convert JS object literal to valid JSON."""
    # Remove var XXXX_DATA = and trailing ;
    content = re.sub(r'^.*?=\s*', '', js_content, count=1, flags=re.DOTALL)
    content = content.rstrip().rstrip(';').strip()

    # Replace single quotes with double quotes (careful with apostrophes in text)
    # Better approach: use a regex to find unquoted keys and quote them
    # Actually the JS files use double quotes already for values, but keys might not be quoted

    # Quote unquoted keys: word: -> "word":
    content = re.sub(r'(\s)(\w+)(\s*:)', r'\1"\2"\3', content)

    # Remove trailing commas before } or ]
    content = re.sub(r',\s*([}\]])', r'\1', content)

    return content

def convert_file(src: str, dst: str, var_name: str):
    js = Path(src).read_text(encoding='utf-8')

    # Extract just the array/object assignment
    match = re.search(rf'var\s+{var_name}\s*=\s*(\[.*\]);', js, re.DOTALL)
    if not match:
        # Try without var
        match = re.search(rf'{var_name}\s*=\s*(\[.*\]);', js, re.DOTALL)
    if not match:
        print(f"Could not find {var_name} in {src}")
        return

    raw = match.group(1)
    json_str = js_to_json(raw)

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        # Write raw for debugging
        Path(dst + '.raw').write_text(json_str, encoding='utf-8')
        return

    Path(dst).write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Wrote {dst} ({len(data)} entries)")


if __name__ == '__main__':
    src_dir = 'G:/Mon Drive/EA Bogot\u00e1/Website/js'
    dst_dir = 'C:/Users/joseg/Documents/ea-bogota-website-astro/src/data'

    convert_file(f'{src_dir}/events-data.js', f'{dst_dir}/events.json', 'EVENTS_DATA')
    convert_file(f'{src_dir}/opportunities-data.js', f'{dst_dir}/opportunities.json', 'OPPORTUNITIES_DATA')
