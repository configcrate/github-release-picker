const PLATFORM_PATTERNS = {
  windows: [/(?:^|[._-])windows?(?:[._-]|$)/, /(?:^|[._-])win(?:32|64)?(?:[._-]|$)/, /\.(?:exe|msi|msix|appx)(?:\.|$)/],
  macos: [/(?:^|[._-])(?:macos?|osx|darwin)(?:[._-]|$)/, /\.(?:dmg|pkg)(?:\.|$)/],
  linux: [/(?:^|[._-])linux(?:[._-]|$)/, /\.(?:appimage|deb|rpm|flatpak)(?:\.|$)/],
};

const ARCH_PATTERNS = {
  x64: [/(?:^|[._-])(?:x86[_-]?64|x64|amd64)(?:[._-]|$)/],
  arm64: [/(?:^|[._-])(?:aarch64|arm64|armv8)(?:[._-]|$)/],
  x86: [/(?:^|[._-])(?:x86(?![_-]?64)|i[3-6]86|win32)(?:[._-]|$)/],
  arm32: [/(?:^|[._-])(?:armv7|armhf|arm32)(?:[._-]|$)/],
  universal: [/(?:^|[._-])(?:universal|noarch|any)(?:[._-]|$)/],
};

const AUXILIARY_PATTERN = /(?:^|[._-])(?:checksums?|sha(?:1|256|512)?sums?|md5sums?|symbols?|debug|pdb|sbom|attestations?|provenance)(?:[._-]|$)|\.(?:sha1|sha256|sha512|md5|sig|asc|pem|pdb)(?:\.|$)/;

const FORMATS = {
  windows: [
    { pattern: /\.msi$/, score: 36, code: "msi" },
    { pattern: /\.exe$/, score: 33, code: "exe" },
    { pattern: /\.(?:msix|appx)$/, score: 30, code: "msix" },
    { pattern: /\.zip$/, score: 16, code: "zip" },
    { pattern: /\.(?:7z|tar\.gz|tgz)$/, score: 8, code: "archive" },
  ],
  macos: [
    { pattern: /\.dmg$/, score: 36, code: "dmg" },
    { pattern: /\.pkg$/, score: 33, code: "pkg" },
    { pattern: /\.zip$/, score: 17, code: "zip" },
    { pattern: /\.(?:tar\.gz|tgz)$/, score: 10, code: "archive" },
  ],
  linux: [
    { pattern: /\.appimage$/, score: 36, code: "appimage" },
    { pattern: /\.deb$/, score: 32, code: "deb" },
    { pattern: /\.rpm$/, score: 29, code: "rpm" },
    { pattern: /\.flatpak$/, score: 27, code: "flatpak" },
    { pattern: /\.(?:tar\.gz|tgz)$/, score: 18, code: "archive" },
    { pattern: /\.zip$/, score: 14, code: "zip" },
  ],
};

export function parseRepoInput(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("empty");

  let path = raw;
  if (/^https?:\/\//i.test(raw)) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      throw new Error("invalid");
    }
    if (!/(^|\.)github\.com$/i.test(url.hostname)) throw new Error("not-github");
    path = url.pathname.replace(/^\/+|\/+$/g, "");
  }

  path = path.replace(/^github\.com\//i, "").replace(/^\/+|\/+$/g, "");
  const parts = path.split("/");
  if (parts.length < 2) throw new Error("invalid");

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(owner) || !/^[\w.-]+$/i.test(repo)) {
    throw new Error("invalid");
  }

  let tag = null;
  if (parts[2] === "releases" && parts[3] === "tag" && parts.length > 4) {
    tag = decodeURIComponent(parts.slice(4).join("/"));
  }

  return { owner, repo, tag, slug: `${owner}/${repo}` };
}

export function buildReleaseApiUrl(parsed) {
  const base = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/releases`;
  return parsed.tag ? `${base}/tags/${encodeURIComponent(parsed.tag)}` : `${base}/latest`;
}

export function inspectAssetName(filename) {
  const name = String(filename || "").toLowerCase();
  const platforms = Object.entries(PLATFORM_PATTERNS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(name)))
    .map(([platform]) => platform);
  const architectures = Object.entries(ARCH_PATTERNS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(name)))
    .map(([architecture]) => architecture);
  return {
    platforms,
    architectures,
    auxiliary: AUXILIARY_PATTERN.test(name),
  };
}

function formatScore(filename, platform) {
  const name = filename.toLowerCase();
  const matched = (FORMATS[platform] || []).find(({ pattern }) => pattern.test(name));
  return matched || { score: 0, code: "file" };
}

export function scoreAsset(asset, target) {
  const info = inspectAssetName(asset.name);
  const format = formatScore(asset.name, target.platform);
  const otherPlatforms = info.platforms.filter((item) => item !== target.platform);
  const explicitPlatformMatch = info.platforms.includes(target.platform);
  const comparableArchitectures = info.architectures.filter((item) => item !== "universal");
  const explicitArchMatch = comparableArchitectures.includes(target.arch);
  const universal = info.architectures.includes("universal");
  const otherArchitectures = comparableArchitectures.filter((item) => item !== target.arch);

  let score = 0;
  const signals = [];
  let eligible = true;

  if (info.auxiliary) {
    eligible = false;
    signals.push("auxiliary");
    score -= 200;
  }

  if (explicitPlatformMatch) {
    score += 44;
    signals.push("platform-match");
  } else if (otherPlatforms.length) {
    eligible = false;
    score -= 100;
    signals.push("platform-mismatch");
  } else {
    score += 7;
    signals.push("platform-unspecified");
  }

  if (explicitArchMatch) {
    score += 36;
    signals.push("arch-match");
  } else if (universal) {
    score += 29;
    signals.push("arch-universal");
  } else if (otherArchitectures.length) {
    eligible = false;
    score -= 75;
    signals.push("arch-mismatch");
  } else {
    score += 6;
    signals.push("arch-unspecified");
  }

  score += format.score;
  if (format.score) signals.push(`format-${format.code}`);

  return { asset, score, eligible, signals, info, format: format.code };
}

export function rankAssets(assets, target) {
  const ranked = (assets || [])
    .map((asset) => scoreAsset(asset, target))
    .sort((a, b) => b.score - a.score || (b.asset.download_count || 0) - (a.asset.download_count || 0));
  const eligible = ranked.filter((item) => item.eligible);
  const best = eligible[0] || null;

  if (!best || best.score < 20) return { ranked, best: null, confidence: "none" };

  const next = eligible[1];
  const margin = next ? best.score - next.score : 99;
  const exactPlatform = best.signals.includes("platform-match");
  const exactArch = best.signals.includes("arch-match") || best.signals.includes("arch-universal");
  const confidence = exactPlatform && exactArch && margin >= 8
    ? "high"
    : exactPlatform && margin >= 5
      ? "medium"
      : "low";

  return { ranked, best, confidence };
}

export function formatBytes(bytes, locale = "en") {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let current = value / 1024;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(current)} ${units[index]}`;
}
