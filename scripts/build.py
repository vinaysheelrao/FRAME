"""Build the single-file app offline using only the Python standard library."""
import argparse
import base64
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def render():
    manifest = json.loads((ROOT / 'assets/PROVENANCE.json').read_text(encoding='utf-8'))
    for asset in manifest['assets']:
        data = (ROOT / asset['path']).read_bytes()
        if hashlib.sha256(data).hexdigest() != asset['sha256']:
            raise ValueError('Asset checksum differs: ' + asset['path'])
    source = (ROOT / 'src/frame.html').read_text(encoding='utf-8')
    notices = []
    for name in ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'PRIVACY.md', 'licenses/Inter-OFL-1.1.txt']:
        text = (ROOT / name).read_text(encoding='utf-8')
        notices.append('<h3>' + html.escape(name) + '</h3><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:12px">' + html.escape(text) + '</pre>')
    replacements = {
        '@@INTER@@': base64.b64encode((ROOT / 'assets/fonts/InterVariable.woff2').read_bytes()).decode('ascii'),
        '@@TMDB_LOGO@@': 'data:image/svg+xml;base64,' + base64.b64encode((ROOT / 'assets/branding/tmdb.svg').read_bytes()).decode('ascii'),
        '@@LEGAL@@': '\n'.join(notices),
    }
    for token, value in replacements.items():
        if source.count(token) != 1:
            raise ValueError('Expected exactly one ' + token)
        source = source.replace(token, value)
    if re.search(r'@@[A-Z_]+@@', source):
        raise ValueError('Unresolved build placeholder')
    return source.encode('utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if FRAME.html differs from an offline rebuild')
    args = parser.parse_args()
    output = ROOT / 'FRAME.html'
    expected = render()
    if args.check:
        if not output.exists() or output.read_bytes() != expected:
            raise SystemExit('FRAME.html is out of date. Run python scripts/build.py')
        print('PASS: FRAME.html matches a deterministic offline build')
    else:
        output.write_bytes(expected)
        print(f'Built {output.name}: {len(expected):,} bytes')


if __name__ == '__main__':
    main()
