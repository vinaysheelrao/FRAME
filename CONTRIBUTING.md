# Contributing

Small bug fixes and accessibility improvements are welcome. Explain the observed
problem, expected result and reproduction steps. Use invented titles and paths.
Do not submit media, credentials, browser profiles or personal library exports.

By intentionally submitting a contribution for inclusion, you agree to license
the rights you hold in it under this repository's FRAME Personal Noncommercial
License 1.0. You retain ownership of those rights. No copyright assignment or
right to relicense others' work is implied. Disclose third-party code/assets and
their licenses; do not submit material you lack permission to contribute.

1. Edit `src/frame.html` or the relevant documentation/build script.
2. Preserve the single-file app and embedded Inter typography. Keep scrollbars
   and sliders slim, rounded, low-contrast, discoverable and keyboard accessible.
3. Run the build, Python tests and JavaScript syntax check in the README.
4. For UI/playback changes, run the optional browser smoke test and manually
   verify the relevant flow in desktop Chrome/Edge and a narrow viewport.
5. Commit the regenerated `FRAME.html` with source changes. Note behavioral and
   privacy changes in `CHANGELOG.md`.

Keep third-party credits, provenance and license exceptions intact. Do not add
automatic scraping, shared API credentials, telemetry or provider-data AI use
without discussing the functionality, permissions and privacy implications first.
Be respectful in issues and reviews; focus feedback on the work.
