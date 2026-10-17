# Publishing this bundle to GitHub

## What is ready

The root `FRAME.html` is a standalone personal-use download with all required
local assets and the license/privacy notices embedded. The repository includes
the editable source, offline builder, tests, third-party asset provenance and
GitHub contribution/issue templates. No shared API credentials are required.

The main project is published at https://github.com/vinaysheelrao/FRAME.
The steps below also apply when publishing an authorized fork under the license.

## Upload

1. Create an empty GitHub repository. Do not select an additional MIT, GPL or
   other license in GitHub's wizard: this bundle already has its chosen license.
2. Put the **contents** of `FRAME-repo` at the repository root, including `.github`,
   `.gitignore` and `.gitattributes`. Git is the most reliable way to include dotfiles.
   Do not upload the surrounding development workspace or personal app backups.
3. Use a description such as: "A standalone local video library. Free for personal
   noncommercial use. Source available. Bring your own media and metadata key."
4. Enable Issues if desired and **Settings → Code security → Private vulnerability
   reporting** (the exact UI label may vary). See SECURITY.md.
5. Confirm the build-check workflow passes. It does not deploy a website or publish
   releases. This bundle is intended as a downloadable local app.
6. Create a `v0.1.0` release and attach the generated `FRAME.html`. GitHub adds source
   archives itself. Optionally attach `FRAME-v0.1.0-personal-use.zip` containing
   the HTML, README, license and third-party notices, plus `SHA256SUMS.txt`.

For a local Git checkout, after replacing the example URL with your actual repo:

```sh
git init
git add .
git commit -m "Initial FRAME personal-use release"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPO.git
git push -u origin main
```

## License intent and remaining owner decisions

- The custom license permits individuals' personal noncommercial use, personal
  modifications and free sharing/forks under the same terms. It prohibits resale,
  monetization and business/professional use. It is not OSI-approved open source;
  GitHub may display it as an unrecognized/custom license. Do not label it MIT.
- "FRAME contributors" is a collective copyright attribution, not an invented
  company or legal identity. You may replace/supplement it with your name or
  chosen rights-holder identity for material you own. Preserve third-party credits.
- No trademark availability or originality clearance has been performed for the
  name FRAME or the overall interface. Consider a distinctive project name and
  a relevant trademark search before wider promotion.
- The license grants only rights the contributors possess. A legal professional
  can review the custom terms and the application's branding/provider integration
  for your jurisdiction. This preparation is not an opinion that every legal
  issue is resolved or that the terms will be enforceable everywhere.
- Do not add ads, subscriptions, donations tied to access, affiliate links or
  shared service credentials without reviewing the license intent and provider
  terms again. Provider permission is independent of the application's license.
- End users obtain their own TMDB credentials and accept TMDB terms. The approved
  attribution logo is included; no provider approval/certification is claimed.
- If you later change the license, you can only relicense rights you hold or have
  permission to relicense; existing recipients retain applicable granted rights.

## Future releases

Build from reviewed source, run checks and update CHANGELOG.md. Review provider
terms again when integrations or monetization change. Do not bundle copyrighted
posters, sample films, downloaded provider datasets, library exports or secrets.
Keep license files and in-app notices with redistributed copies. If maintaining
an older version's backups, remember that they may contain cached TMDB content
and sensitive paths which this release deliberately excludes from new exports.

The attached SHA-256 manifest detects accidental file changes. It is not a digital
signature and does not establish publisher authenticity.
