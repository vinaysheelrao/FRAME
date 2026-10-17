# Privacy and local data

FRAME has no developer-operated backend, analytics, ads, sign-in or telemetry.
This describes the supplied app, not browser extensions or modified copies.

## Local storage and files

Selected videos and subtitles are read locally. FRAME does not upload, move,
rename or delete them. The browser may remember folder handles with your consent.
An IndexedDB database named `FRAME-local-cinema` holds library entries, relative
paths, metadata, watchlist, progress, cached artwork, settings and folder handles.
If you enter a library root for File location, that absolute path is stored too.

A TMDB credential stays in memory unless you check Remember. Remembered
credentials are stored in this browser's IndexedDB without application-level
encryption. Clearing Remember and saving settings removes the stored credential;
the current tab can still use the credential you entered until closed or cleared.

## Network requests

- TMDB: `api.themoviedb.org` receives title/year queries, language, IDs and your
  credential. A v3 API key is sent in the query string; a read token uses an
  Authorization header. Images load from `image.tmdb.org`.
- TVmaze: `api.tvmaze.com` receives series title queries and IDs; its image hosts,
  normally `static.tvmaze.com`, serve artwork and actor photos.
- Providers/image servers can see your IP and browser request metadata. Filenames
  are cleaned into search queries; imperfect cleanup can leave identifying text.
  Video bytes and full source disk paths are not sent as lookup parameters.
- Imported metadata may contain other HTTPS image URLs. Displaying those images
  contacts the corresponding hosts. Import backups only from trusted sources.
- IMDb, JustWatch, Google and informational links open only when you follow them.
  Search links send the title/year in a URL. Their own policies then apply.

The embedded font and attribution logo need no network requests. A fresh install
with no library and no credential does not initiate metadata or artwork requests.
Offline mode disables metadata search, but uncached image URLs in existing
entries may still load. Disconnect networking for a completely disconnected run.

## Backups, retention and deletion

JSON backups omit credentials, folder permission handles and videos. They can
include filenames, full paths you entered, viewing history, manual artwork and
TVmaze data. TMDB content is excluded; provider match IDs remain. Do not post
backups publicly. Their data is not encrypted.

TMDB metadata and image cache expire after 150 days, checked at startup and
while active. Unknown-age TMDB imports are discarded. FRAME cannot run cleanup
while its HTML is closed. Use the provider again to refresh expired records.

Removing a folder in Settings removes its library entries but may leave unused
cached artwork. To erase all FRAME storage, close other FRAME tabs and clear
this app's IndexedDB/site data using your browser's developer tools or storage
settings. This removes the saved library, credentials, cached images and handles;
it does not delete source videos or backup files. Delete exported backups yourself
if you no longer need them. Browser storage/permissions differ for local file URLs.
