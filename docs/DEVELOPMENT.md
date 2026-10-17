# Development

## Layout

```
FRAME.html                 Ready-to-open generated app
src/frame.html             Editable application (HTML, CSS and JS)
assets/fonts/              Unmodified embedded Inter font
assets/branding/           Approved TMDB attribution logo
assets/PROVENANCE.json      Source URLs and asset SHA-256 digests
licenses/                  Complete Inter license
scripts/build.py           Offline standard-library builder
scripts/check-js.cjs       Node.js syntax check
tests/                     Distribution checks and browser smoke test
.github/workflows/         Build verification on pushes/pull requests
```

The app uses browser APIs and IndexedDB directly. There is no JavaScript framework,
runtime package download, server, bundler or npm dependency required to run it.
The input HTML uses three tokens for the font, attribution logo and legal notices.
`scripts/build.py` embeds all three and verifies recorded asset hashes.

Run the README's build/check commands after editing. CI runs those same commands
with read-only repository permissions. A separate release workflow runs only when
a release is published. It verifies the same source, packages tracked files and
attaches the app, ZIP downloads and checksums using a temporary repository token.
Only that release job receives contents-write permission; credentials are not saved.

## Optional browser smoke test

Use Node.js 20+ with Playwright installed in a development environment. The test
was validated with Playwright 1.62.1 and Edge. To reproduce using a temporary
development install (no runtime dependency):

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
node tests/smoke.cjs
```

Alternatively set `FRAME_PLAYWRIGHT_PATH` to an existing Playwright module and
`FRAME_BROWSER_CHANNEL=msedge` to use installed Edge. Screenshots and temporary
test data go to your OS temporary directory, never into the repository.

The smoke test uses a fresh browser context, synthetic video metadata and mocked
provider responses. It tests startup without requests, license UI, provider
provenance through edits and export/import, cache expiry, series grouping and
keyboard seeking without fullscreen. It does not certify real codec playback,
live provider credentials, OS picker behavior or legal compliance. Manually test
real playback and reconnection using media you can lawfully use before releases.

## Provider content lifecycle

`attributions` stores validated source URLs and whether the user edited data.
`metadataFetchedAt` and cached image timestamps track age. TMDB data is cleared
after 150 days at startup, at active one-minute checks, and on return to a visible
tab. A closed/suspended browser cannot run a deletion job. The record's provider
ID and local progress survive, so Auto-match can refresh it without rematching.
Legacy records without timestamps are treated as expired.

Export does not serialize TMDB content. TVmaze data keeps CC BY-SA credits and
change indications separately from the software license. Imported attribution
URLs are validated; arbitrary JavaScript URLs are not accepted. Existing backups
remain version 1 compatible, with extra fields for licenses/provenance.

Do not publish real API responses as test fixtures or include movie images in
documentation screenshots without separately verifying distribution rights.
