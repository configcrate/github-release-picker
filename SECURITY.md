# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub's **Report a vulnerability** feature instead of opening a public issue.

Do not include GitHub tokens, private repository URLs, credentials, or personal data in a report. GitHub Release Picker never needs a token and supports public repositories only.

## Data flow

The site is a static client-side application. It sends the public repository name to `api.github.com` and links downloads to GitHub's `browser_download_url`. It has no ConfigCrate backend, analytics, or telemetry.
