# GitHub Release Picker — Article Handoff

## Project status

- Product name: GitHub Release Picker / GitHub 下载选择器
- Repository: https://github.com/configcrate/github-release-picker
- Web app: https://configcrate.github.io/github-release-picker/
- Version: v0.1.0
- Audience: ordinary GitHub users, especially people downloading open-source desktop and command-line tools for the first time
- Languages: Chinese and English
- Brand link: https://configcrate.com/

## One-sentence description

粘贴 GitHub 项目链接，工具会根据操作系统、处理器架构和安装包格式，从最新发行版中挑出最适合下载的文件，并解释为什么。

## The pain

GitHub Releases often presents names such as:

```text
app-v2.4.1-windows-amd64.exe
app-v2.4.1-darwin-arm64.dmg
app-v2.4.1-linux-x86_64.tar.gz
checksums.txt
Source code (zip)
```

For a developer these names are normal. A beginner must understand that `darwin` means macOS, `amd64` usually means a normal Intel/AMD 64-bit computer, ARM64 is different, a checksum is not the application, and source code is not normally the installer. The result is hesitation, a wrong download, or abandoning the project.

## What the tool does

1. Accepts `owner/repository`, a repository URL, or a tagged release URL.
2. Requests public release metadata directly from GitHub's official API.
3. Uses browser-provided platform information when available.
4. Keeps Windows/macOS/Linux and x64/ARM64 controls visible so the user can correct detection.
5. Classifies each asset by platform, architecture, packaging format, and auxiliary-file signals.
6. Prioritizes compatible installers and archives.
7. Excludes checksums, signatures, symbols, SBOMs, debug files, and incompatible builds.
8. Shows a confidence level and refuses to recommend when no safe candidate exists.
9. Sends the final download directly to GitHub's original asset URL.

## Important trust points

- No installation.
- No account or GitHub login.
- No API key or token.
- No backend, analytics, telemetry, upload, proxy, or download modification.
- Open-source and usable from GitHub Pages.
- Public repositories only in v0.1.

## Honest limitations

- There is no universal naming standard for GitHub release assets.
- Browsers do not always expose CPU architecture, so the user may need to confirm x64 or ARM64.
- Linux users may still need project documentation to choose between DEB, RPM, AppImage, and distribution-specific builds.
- Projects with only source code or unclear filenames may not receive a recommendation.
- GitHub's unauthenticated public API has a per-network rate limit.

These limitations are part of the product design: the tool says when it is uncertain instead of inventing certainty.

## Validation completed

- Unit tests cover repository parsing, tagged release URLs, platform detection from filenames, `darwin` versus Windows, `x86_64` versus 32-bit x86, auxiliary-file exclusion, ranking, and file sizes.
- Real release checks:
  - `configcrate/codex-titlebar-meter` → Windows x64 ZIP
  - `sharkdp/bat` → Windows x64 ZIP
  - `sharkdp/bat` → macOS ARM64 archive
  - `cli/cli` → deliberately lower confidence on Linux because DEB/RPM choice is ambiguous
- Desktop and 375 px mobile layouts checked in a browser.
- Chinese/English switching and incompatible-platform no-match behavior checked.

## Suggested article angles

### Chinese headline options

1. GitHub 下载文件太多看不懂？这个工具直接告诉你选哪个
2. amd64、arm64、darwin 到底是什么？以后下载 GitHub 软件不用猜了
3. 给 GitHub 做了一个“小白下载模式”

### Opening hook

很多人第一次从 GitHub 下载软件，真正挡住他的不是安装，而是十几个看不懂的文件名。Windows 应该选 amd64 还是 arm64？darwin 是什么？Source code.zip 能不能直接运行？GitHub 下载选择器就是为这一步做的。

### Article structure

1. 展示一个资源很多的 Releases 页面。
2. 解释普通用户为什么容易选错。
3. 展示粘贴链接后的推荐结果。
4. 强调“无法确认时不乱猜”。
5. 说明隐私、直接下载和开源属性。
6. 给出网页与 GitHub 地址。

## Short-video copy

```text
GitHub 下载软件，
十几个文件到底该选哪个？

Windows、macOS、x64、ARM64，
还有源码和校验文件。

把项目链接粘贴进来，
它会直接告诉你该下载哪个。

无法确认时也不会乱猜。
GitHub 下载选择器。
```

## Required links

- Tool: https://configcrate.github.io/github-release-picker/
- GitHub: https://github.com/configcrate/github-release-picker
- ConfigCrate: https://configcrate.com/
