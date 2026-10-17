"""Offline distribution checks; no credentials or provider requests required."""
import base64
import importlib.util
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('frame_build', ROOT / 'scripts/build.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class HTMLResources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        if tag in ('img', 'script', 'iframe', 'video', 'audio', 'source') and values.get('src'):
            self.resources.append(values['src'])
        if tag == 'link' and values.get('rel') in ('stylesheet', 'preload'):
            self.resources.append(values.get('href', ''))


class BundleTests(unittest.TestCase):
    def setUp(self):
        self.data = build.render()
        self.html = self.data.decode('utf-8')

    def test_reproducible_release(self):
        self.assertEqual(self.data, (ROOT / 'FRAME.html').read_bytes())
        self.assertEqual(build.render(), self.data)

    def test_notices_travel_with_single_file(self):
        for text in ('FRAME Personal Noncommercial License 1.0', 'SIL OPEN FONT LICENSE',
                     'Copyright (c) 2016 The Inter Project Authors', 'CC BY-SA 4.0',
                     'This product uses the TMDB API but is not endorsed or certified by TMDB.'):
            self.assertIn(text, self.html)

    def test_no_bundled_posters_or_external_startup_resources(self):
        parser = HTMLResources()
        parser.feed(self.html)
        self.assertEqual(len(parser.ids), len(set(parser.ids)), 'Duplicate HTML IDs')
        self.assertTrue(all(url.startswith('data:') for url in parser.resources))
        self.assertNotRegex(self.html, r'data:image/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]{100}')
        self.assertIn('const PREVIEW=[];', self.html)
        self.assertNotRegex(self.html, r'@@[A-Z_]+@@')

    def test_embedded_assets_exactly_match_attributed_sources(self):
        font = re.search(r'data:font/woff2;base64,([A-Za-z0-9+/=]+)', self.html).group(1)
        logo = re.search(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', self.html).group(1)
        self.assertEqual(base64.b64decode(font), (ROOT / 'assets/fonts/InterVariable.woff2').read_bytes())
        self.assertEqual(base64.b64decode(logo), (ROOT / 'assets/branding/tmdb.svg').read_bytes())


if __name__ == '__main__':
    unittest.main()
