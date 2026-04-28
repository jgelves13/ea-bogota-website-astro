"""Convert JS data files to JSON using Node.js for reliable parsing."""
import subprocess
import json
from pathlib import Path

src_dir = 'G:/Mon Drive/EA Bogot\u00e1/Website/js'
dst_dir = 'C:/Users/joseg/Documents/ea-bogota-website-astro/src/data'

# Events
events_js = Path(f'{src_dir}/events-data.js').read_text(encoding='utf-8')
node_script = events_js + '\nconsole.log(JSON.stringify(EVENTS_DATA));'
result = subprocess.run(['node', '-e', node_script], capture_output=True, text=True, encoding='utf-8')
if result.returncode == 0:
    data = json.loads(result.stdout)
    Path(f'{dst_dir}/events.json').write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Events: {len(data)} entries")
else:
    print(f"Events error: {result.stderr}")

# Opportunities
opps_js = Path(f'{src_dir}/opportunities-data.js').read_text(encoding='utf-8')
node_script2 = opps_js + '\nconsole.log(JSON.stringify(OPPORTUNITIES_DATA));'
result2 = subprocess.run(['node', '-e', node_script2], capture_output=True, text=True, encoding='utf-8')
if result2.returncode == 0:
    data2 = json.loads(result2.stdout)
    Path(f'{dst_dir}/opportunities.json').write_text(json.dumps(data2, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Opportunities: {len(data2)} entries")
else:
    print(f"Opps error: {result2.stderr}")
