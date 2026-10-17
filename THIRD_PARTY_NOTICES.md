# Third-party notices

Reviewed 2026-10-17. These notices describe the bundled assets and integrations;
they do not replace the providers' applicable terms or guarantee rights clearance.

## Inter

`assets/fonts/InterVariable.woff2` is an unmodified Inter variable font from
[The Inter Project](https://github.com/rsms/inter). Copyright (c) 2016 The Inter
Project Authors. Licensed under the SIL Open Font License 1.1; the complete
license is in [licenses/Inter-OFL-1.1.txt](licenses/Inter-OFL-1.1.txt) and embedded
in the standalone app. It is not covered by FRAME's noncommercial restriction.

Upstream source used:
https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/InterVariable.woff2

The original download did not record a commit ID. The checked-in font is the
exact build input, with its SHA-256 recorded in `assets/PROVENANCE.json`. Builds
do not download whatever happens to be on upstream's current branch.

## TMDB

`assets/branding/tmdb.svg` is TMDB's unmodified approved alternate short blue
attribution logo, obtained from its [logos and attribution page](https://www.themoviedb.org/about/logos-attribution).
The logo is used solely to identify the optional API integration, at a smaller
size than FRAME branding. It remains subject to TMDB's branding rules and is
excluded from the FRAME software license. No general logo/trademark license is
granted by this repository.

This product uses the TMDB API but is not endorsed or certified by TMDB.
This application uses TMDB and the TMDB APIs but is not endorsed, certified, or
otherwise approved by TMDB.

Users supply their own credentials and are responsible for their API agreement.
TMDB data and artwork are fetched at runtime and are not bundled. Local copies
expire after 150 days, below the terms' six-month caching limit. Offline browser
storage cannot be purged while FRAME is closed: expiry is applied on opening
and periodically while active. Exports omit TMDB-derived metadata and cached
images, retaining match identifiers for a fresh lookup. Previously exported
backups made by older versions remain the user's responsibility.

TMDB's terms restrict commercial use, derivatives, and ML/AI-related use of its
content. FRAME's matching uses deterministic filename comparison and ranking;
it does not train a model or send provider data to an AI service. A future AI
integration would need a fresh provider-permissions review. The software license
does not grant redistribution, media, likeness or publicity rights in TMDB data.

References:
- https://www.themoviedb.org/api-terms-of-use
- https://developer.themoviedb.org/docs/faq
- https://www.themoviedb.org/about/logos-attribution

## TVmaze

TVmaze API data is supplied under
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)
as described in the [TVmaze API documentation](https://www.tvmaze.com/api).
No TVmaze dataset is bundled. FRAME links to the source show in title details.
It selects/normalizes fields, converts summary HTML to text, and truncates the
cast list for display. User edits retain source attribution and a modification
flag. Backups carry per-item source URLs and data license notices.

If you redistribute TVmaze-derived data or adaptations, preserve the source
credit, license link and change notices, and comply with ShareAlike. FRAME's
personal/noncommercial restrictions do not apply to TVmaze data and must not
be imposed on it. This does not relicense the independent application code.

Provider-supplied material can involve third-party copyright, trademark, privacy
or publicity rights not resolved by a software or data license. See also
https://www.tvmaze.com/site/copyright and the CC license's limitations.

## Other names and materials

Netflix, IMDb and JustWatch are third-party names used only for identification
and ordinary search links. No logos, saved pages, scraped site code, film posters,
screenshots containing third-party artwork, or video samples from those services
are included. The interface uses original application code and inline geometric
icons; its general streaming-library layout does not imply affiliation.

No third-party JavaScript runtime library is bundled. Optional browser tests use
the separately installed Playwright package (Apache-2.0), which is not included
in the download. Python and Node.js are build/test tools, not redistributed here.
