"""Package tracked files and attach downloads to a published GitHub release.

Runs only in a release-triggered GitHub Actions job with its temporary token.
No local browser access or stored credentials are used.
"""
import hashlib
import json
import mimetypes
import os
import re
import subprocess
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def package(version):
    if not re.fullmatch(r'v\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?', version):
        raise ValueError('Expected a version tag such as v0.1.0')
    output = ROOT / 'release-dist'
    output.mkdir(exist_ok=True)
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode('utf-8').split('\0')
    names = sorted(name for name in tracked if name)
    for name in names:
        path = ROOT / name
        if path.is_symlink() or not path.resolve().is_relative_to(ROOT) or not path.is_file():
            raise ValueError('Unsupported release input: ' + name)
    timestamp = (2026, 10, 17, 0, 0, 0)

    def archive(filename, included, prefix):
        dest = output / filename
        with zipfile.ZipFile(dest, 'w', compression=zipfile.ZIP_DEFLATED) as z:
            for name in included:
                info = zipfile.ZipInfo(prefix + name, date_time=timestamp)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o644 << 16
                z.writestr(info, (ROOT / name).read_bytes())
        with zipfile.ZipFile(dest) as z:
            if z.testzip() is not None:
                raise ValueError('ZIP integrity check failed')
        return dest

    source = archive(f'FRAME-{version}-github-repo.zip', names, 'FRAME-repo/')
    runtime = {'FRAME.html', 'START-HERE.txt', 'LICENSE', 'PRIVACY.md', 'THIRD_PARTY_NOTICES.md'}
    personal = archive(f'FRAME-{version}-personal-use.zip',
                       [name for name in names if name in runtime or name.startswith('licenses/')], 'FRAME/')
    assets = [ROOT / 'FRAME.html', personal, source]
    sums = output / 'SHA256SUMS.txt'
    sums.write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name + '\n' for p in assets), encoding='ascii')
    return assets + [sums]


def main():
    if os.environ.get('GITHUB_EVENT_NAME') != 'release':
        raise SystemExit('This publisher runs only from a GitHub release event')
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text(encoding='utf-8'))
    release = event['release']
    if event['action'] != 'published' or release.get('draft'):
        raise SystemExit('A published release is required')
    token = os.environ['GITHUB_TOKEN']
    repository = os.environ['GITHUB_REPOSITORY']
    upload_url = release['upload_url'].split('{')[0]
    parsed = urllib.parse.urlparse(upload_url)
    if parsed.scheme != 'https' or parsed.netloc != 'uploads.github.com' or parsed.path != f'/repos/{repository}/releases/{release["id"]}/assets':
        raise ValueError('Unexpected release upload destination')
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'FRAME-release-builder'}
    # Refuse to replace existing assets; reruns can skip identical uploaded bytes.
    assets_url = f'https://api.github.com/repos/{repository}/releases/{release["id"]}/assets'
    with urllib.request.urlopen(urllib.request.Request(assets_url, headers=headers), timeout=60) as response:
        existing = {a['name']: a for a in json.load(response)}
    for path in package(release['tag_name']):
        data = path.read_bytes()
        digest = 'sha256:' + hashlib.sha256(data).hexdigest()
        if path.name in existing:
            if existing[path.name].get('digest') == digest:
                print('Verified existing asset:', path.name)
                continue
            raise ValueError('An asset with different or unverified content already exists: ' + path.name)
        url = upload_url + '?' + urllib.parse.urlencode({'name': path.name})
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        req = urllib.request.Request(url, data=data, method='POST', headers={**headers, 'Content-Type': mime})
        with urllib.request.urlopen(req, timeout=120) as response:
            uploaded = json.load(response)
        if uploaded.get('size') != len(data) or (uploaded.get('digest') and uploaded['digest'] != digest):
            raise ValueError('Uploaded asset did not match: ' + path.name)
        print('Published:', uploaded['browser_download_url'])


if __name__ == '__main__':
    main()
