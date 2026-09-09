from pathlib import Path
import json,tomllib
root=Path('.')
cargo=tomllib.loads((root/'apps/hardware-agent/src-tauri/Cargo.toml').read_text())
conf=json.loads((root/'apps/hardware-agent/src-tauri/tauri.conf.json').read_text())
cap=json.loads((root/'apps/hardware-agent/src-tauri/capabilities/default.json').read_text())
rs=(root/'apps/hardware-agent/src-tauri/src/lib.rs').read_text()
html=(root/'apps/hardware-agent/src/index.html').read_text()
tests=[
('tauri current pinned',cargo['dependencies']['tauri']['version']=='2.11.5'),
('sysinfo pinned',cargo['dependencies']['sysinfo']=='0.39.6'),
('rust minimum',cargo['package']['rust-version']=='1.95'),
('local CSP',"default-src 'self'" in conf['app']['security']['csp']),
('global Tauri enabled',conf['app'].get('withGlobalTauri') is True),
('no external frontend CDN','https://' not in html and 'http://' not in html),
('no shell/http permission',all('shell' not in x and 'http' not in x for x in cap['permissions'])),
('no network crate','reqwest' not in cargo['dependencies']),
('consent privacy note','permanece local' in rs),
('read-only command','get_hardware_snapshot' in rs and 'install' not in rs.lower()),
]
fail=False
for n,p in tests:
 print(('PASS' if p else 'FAIL'),n);fail|=not p
if fail: raise SystemExit(1)
