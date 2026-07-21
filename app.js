import { buildReleaseApiUrl, formatBytes, parseRepoInput, rankAssets } from "./src/release-picker.js";

const messages = {
  en: {
    eyebrow: "A simpler way to download from GitHub",
    title: "Stop guessing which file to download.",
    subtitle: "Paste a GitHub repository. We inspect its latest release and point you to the best file for your device.",
    inputLabel: "GitHub repository",
    placeholder: "owner/repository  or  GitHub URL",
    findButton: "Find my download",
    tryExample: "Try an example",
    publicOnly: "Public repositories only",
    yourDevice: "Your device",
    deviceHint: "Check these before downloading.",
    detectedDevice: "Detected {platform} · {arch}. Change if needed.",
    confirmArch: "Detected {platform}. Please confirm x64 or ARM64.",
    latestRelease: "Latest release",
    viewRelease: "View release",
    recommended: "Recommended for you",
    possibleMatch: "Possible match — please verify",
    confidenceHigh: "High-confidence match",
    confidenceMedium: "Likely match",
    confidenceLow: "Filename is ambiguous",
    download: "Download from GitHub",
    downloadNote: "The file comes directly from GitHub. We never proxy or modify it.",
    noMatchTitle: "We cannot safely pick one file.",
    noMatchCopy: "The filenames do not clearly identify a compatible download. Open the release page or check the project's instructions.",
    otherFiles: "Other release files",
    howKicker: "Simple by design",
    howTitle: "From repository to the right file.",
    step1Title: "Paste a link",
    step1Copy: "Use an owner/repository name or any GitHub repository and release URL.",
    step2Title: "Confirm your device",
    step2Copy: "We detect what browsers expose. You stay in control when they do not.",
    step3Title: "Download confidently",
    step3Copy: "Installers are prioritized. Source code, checksums, and incompatible builds are explained.",
    privacyTitle: "No login. No API key. No tracking.",
    privacyCopy: "Your selection stays in this browser. Public release information is requested directly from GitHub's API.",
    notAffiliated: "Not affiliated with GitHub.",
    loading: "Checking the latest release and comparing files…",
    empty: "Paste a repository name or GitHub link first.",
    invalid: "That does not look like a GitHub repository. Try owner/repository or paste its URL.",
    notFound: "No published release was found. Check the repository name or open its Releases page.",
    rateLimited: "GitHub's public API limit was reached for this network. Wait a while and try again.",
    networkError: "Could not reach GitHub. Check your connection and try again.",
    noAssets: "This release has no downloadable app files. It may only provide source code.",
    platformMatch: "Made for {platform}",
    archMatch: "Matches {arch}",
    universal: "Universal build",
    installer: "{format} package",
    fileMeta: "{size} · {downloads} downloads",
    noDownloads: "download count unavailable",
    downloadShort: "Download",
    assetAuxiliary: "Checksum, signature, or developer file",
    assetPlatformMismatch: "For another operating system",
    assetArchMismatch: "For another processor type",
    assetAlternative: "Alternative package",
    releasedOn: "Released {date}",
    platform_windows: "Windows",
    platform_macos: "macOS",
    platform_linux: "Linux",
    format_msi: "MSI installer",
    format_exe: "Windows app",
    format_msix: "MSIX installer",
    format_dmg: "DMG installer",
    format_pkg: "macOS package",
    format_appimage: "AppImage",
    format_deb: "DEB package",
    format_rpm: "RPM package",
    format_flatpak: "Flatpak",
    format_zip: "ZIP archive",
    format_archive: "Archive",
    format_file: "Release file",
  },
  zh: {
    eyebrow: "更简单的 GitHub 下载方式",
    title: "GitHub 文件很多？直接告诉你该下载哪个。",
    subtitle: "粘贴 GitHub 项目，我们会读取最新发行版，并为你的设备找出最合适的文件。",
    inputLabel: "GitHub 项目",
    placeholder: "账号/项目名  或  GitHub 链接",
    findButton: "帮我选择",
    tryExample: "试一个示例",
    publicOnly: "目前仅支持公开项目",
    yourDevice: "你的设备",
    deviceHint: "下载前请确认这两项。",
    detectedDevice: "已识别 {platform} · {arch}，如有误可修改。",
    confirmArch: "已识别 {platform}，请确认是 x64 还是 ARM64。",
    latestRelease: "最新发行版",
    viewRelease: "查看发行版",
    recommended: "推荐你下载",
    possibleMatch: "可能匹配，请先确认",
    confidenceHigh: "高可信匹配",
    confidenceMedium: "很可能适用",
    confidenceLow: "文件名不够明确",
    download: "从 GitHub 直接下载",
    downloadNote: "文件直接来自 GitHub，我们不会中转或修改文件。",
    noMatchTitle: "暂时无法安全地替你选择。",
    noMatchCopy: "这些文件名没有明确说明适用设备，请查看项目说明或进入发行版页面确认。",
    otherFiles: "其他发行文件",
    howKicker: "简单，但不乱猜",
    howTitle: "从项目链接，到选对文件。",
    step1Title: "粘贴链接",
    step1Copy: "可以输入“账号/项目名”，也可以粘贴项目或发行版链接。",
    step2Title: "确认设备",
    step2Copy: "浏览器能识别的我们自动填写，不能可靠识别的交给你确认。",
    step3Title: "放心下载",
    step3Copy: "优先安装包，并解释源码、校验文件以及不兼容版本。",
    privacyTitle: "无需登录、无需 API Key、没有跟踪。",
    privacyCopy: "设备选择只保存在当前浏览器，公开发行信息直接从 GitHub API 获取。",
    notAffiliated: "本项目与 GitHub 官方无隶属关系。",
    loading: "正在读取最新发行版，并比较所有文件……",
    empty: "请先粘贴项目名称或 GitHub 链接。",
    invalid: "这似乎不是有效的 GitHub 项目，请输入“账号/项目名”或粘贴项目链接。",
    notFound: "没有找到已发布的发行版，请检查项目名称或查看它的 Releases 页面。",
    rateLimited: "当前网络已达到 GitHub 公开 API 限额，请稍后再试。",
    networkError: "暂时无法连接 GitHub，请检查网络后重试。",
    noAssets: "这个发行版没有可下载的程序文件，可能只提供源码。",
    platformMatch: "适用于 {platform}",
    archMatch: "匹配 {arch}",
    universal: "通用版本",
    installer: "{format}",
    fileMeta: "{size} · 已下载 {downloads} 次",
    noDownloads: "暂无下载次数",
    downloadShort: "下载",
    assetAuxiliary: "校验、签名或开发者文件",
    assetPlatformMismatch: "适用于其他操作系统",
    assetArchMismatch: "适用于其他处理器",
    assetAlternative: "其他安装格式",
    releasedOn: "发布于 {date}",
    platform_windows: "Windows",
    platform_macos: "macOS",
    platform_linux: "Linux",
    format_msi: "MSI 安装程序",
    format_exe: "Windows 程序",
    format_msix: "MSIX 安装程序",
    format_dmg: "DMG 安装程序",
    format_pkg: "macOS 安装包",
    format_appimage: "AppImage 程序",
    format_deb: "DEB 安装包",
    format_rpm: "RPM 安装包",
    format_flatpak: "Flatpak 安装包",
    format_zip: "ZIP 压缩包",
    format_archive: "压缩包",
    format_file: "发行文件",
  },
};

const elements = {
  form: document.querySelector("#repo-form"),
  input: document.querySelector("#repo-input"),
  submit: document.querySelector("#repo-form button[type='submit']"),
  language: document.querySelector("#language-button"),
  example: document.querySelector("#try-example"),
  platform: document.querySelector("#platform-selector"),
  arch: document.querySelector("#arch-selector"),
  deviceHint: document.querySelector("#device-hint"),
  status: document.querySelector("#status"),
  results: document.querySelector("#results"),
  releaseName: document.querySelector("#release-name"),
  releaseLink: document.querySelector("#release-link"),
  recommendation: document.querySelector("#recommendation"),
  noMatch: document.querySelector("#no-match"),
  badge: document.querySelector("#recommend-badge"),
  confidence: document.querySelector("#confidence"),
  recommendedName: document.querySelector("#recommended-name"),
  recommendedMeta: document.querySelector("#recommended-meta"),
  matchReasons: document.querySelector("#match-reasons"),
  download: document.querySelector("#download-button"),
  otherFiles: document.querySelector("#other-files"),
  assetCount: document.querySelector("#asset-count"),
  assetList: document.querySelector("#asset-list"),
  assetTemplate: document.querySelector("#asset-template"),
};

const state = {
  language: localStorage.getItem("release-picker-language") || (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"),
  target: { platform: "windows", arch: "x64" },
  architectureCertain: false,
  release: null,
  parsed: null,
};

function t(key, values = {}) {
  let output = messages[state.language][key] || messages.en[key] || key;
  for (const [name, value] of Object.entries(values)) output = output.replace(`{${name}}`, value);
  return output;
}

function applyLanguage() {
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = state.language === "zh" ? "GitHub 下载选择器" : "GitHub Release Picker";
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  elements.language.textContent = state.language === "zh" ? "EN" : "中文";
  updateDeviceUI();
  if (state.release) renderResults(false);
}

function platformLabel(platform) {
  return t(`platform_${platform}`);
}

function updateDeviceUI() {
  elements.platform.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.value === state.target.platform));
  elements.arch.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.value === state.target.arch));
  const key = state.architectureCertain ? "detectedDevice" : "confirmArch";
  elements.deviceHint.textContent = t(key, { platform: platformLabel(state.target.platform), arch: state.target.arch });
}

function selectTarget(group, value, userInitiated = true) {
  state.target[group] = value;
  if (group === "arch" && userInitiated) state.architectureCertain = true;
  localStorage.setItem("release-picker-target", JSON.stringify(state.target));
  updateDeviceUI();
  if (state.release) renderResults(false);
}

async function detectDevice() {
  const saved = localStorage.getItem("release-picker-target");
  if (saved) {
    try {
      state.target = { ...state.target, ...JSON.parse(saved) };
      state.architectureCertain = true;
      updateDeviceUI();
      return;
    } catch { /* Ignore invalid local state. */ }
  }

  const ua = navigator.userAgent || "";
  const exposedPlatform = navigator.userAgentData?.platform || navigator.platform || ua;
  if (/mac/i.test(exposedPlatform)) state.target.platform = "macos";
  else if (/linux|x11/i.test(exposedPlatform)) state.target.platform = "linux";
  else if (/win/i.test(exposedPlatform)) state.target.platform = "windows";

  if (/arm64|aarch64/i.test(ua)) {
    state.target.arch = "arm64";
    state.architectureCertain = true;
  } else if (/x86_64|x64|win64|amd64/i.test(ua)) {
    state.target.arch = "x64";
    state.architectureCertain = true;
  }

  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const details = await navigator.userAgentData.getHighEntropyValues(["architecture", "bitness"]);
      if (details.architecture === "arm" && details.bitness === "64") {
        state.target.arch = "arm64";
        state.architectureCertain = true;
      } else if (details.architecture === "x86" && details.bitness === "64") {
        state.target.arch = "x64";
        state.architectureCertain = true;
      }
    } catch { /* Browser chose not to expose architecture. */ }
  }
  updateDeviceUI();
}

function showStatus(message, error = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", error);
  elements.status.hidden = false;
}

function hideStatus() {
  elements.status.hidden = true;
}

function reasonForAsset(item) {
  if (item.signals.includes("auxiliary")) return t("assetAuxiliary");
  if (item.signals.includes("platform-mismatch")) return t("assetPlatformMismatch");
  if (item.signals.includes("arch-mismatch")) return t("assetArchMismatch");
  return t("assetAlternative");
}

function formatName(code) {
  return t(`format_${code}`);
}

function renderAssetList(ranked, best) {
  elements.assetList.replaceChildren();
  const others = ranked.filter((item) => item !== best);
  elements.assetCount.textContent = `(${others.length})`;
  elements.otherFiles.hidden = others.length === 0;

  for (const item of others) {
    const row = elements.assetTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector("strong").textContent = item.asset.name;
    row.querySelector("small").textContent = `${formatBytes(item.asset.size, state.language)} · ${reasonForAsset(item)}`;
    const link = row.querySelector("a");
    link.href = item.asset.browser_download_url;
    link.querySelector("span").textContent = t("downloadShort");
    if (item.eligible) row.querySelector(".asset-dot").style.background = "#4f9cf5";
    elements.assetList.append(row);
  }
}

function renderResults(shouldScroll = true) {
  const release = state.release;
  const result = rankAssets(release.assets, state.target);
  const releaseTitle = release.name && release.name !== release.tag_name ? `${release.name} · ${release.tag_name}` : release.tag_name;
  elements.releaseName.textContent = `${state.parsed.slug} ${releaseTitle || ""}`.trim();
  elements.releaseLink.href = release.html_url;
  elements.releaseLink.title = t("releasedOn", {
    date: new Intl.DateTimeFormat(state.language === "zh" ? "zh-CN" : "en", { dateStyle: "medium" }).format(new Date(release.published_at)),
  });

  const best = result.best;
  elements.recommendation.hidden = !best;
  elements.noMatch.hidden = Boolean(best);

  if (best) {
    elements.recommendation.classList.toggle("low-confidence", result.confidence === "low");
    elements.badge.textContent = result.confidence === "low" ? t("possibleMatch") : t("recommended");
    elements.confidence.textContent = t(`confidence${result.confidence[0].toUpperCase()}${result.confidence.slice(1)}`);
    elements.recommendedName.textContent = best.asset.name;
    elements.recommendedMeta.textContent = t("fileMeta", {
      size: formatBytes(best.asset.size, state.language),
      downloads: Number.isFinite(best.asset.download_count)
        ? new Intl.NumberFormat(state.language === "zh" ? "zh-CN" : "en").format(best.asset.download_count)
        : t("noDownloads"),
    });
    elements.download.href = best.asset.browser_download_url;
    elements.matchReasons.replaceChildren();
    const reasons = [];
    if (best.signals.includes("platform-match")) reasons.push(t("platformMatch", { platform: platformLabel(state.target.platform) }));
    if (best.signals.includes("arch-match")) reasons.push(t("archMatch", { arch: state.target.arch }));
    if (best.signals.includes("arch-universal")) reasons.push(t("universal"));
    reasons.push(t("installer", { format: formatName(best.format) }));
    for (const reason of reasons) {
      const chip = document.createElement("span");
      chip.textContent = reason;
      elements.matchReasons.append(chip);
    }
  }

  renderAssetList(result.ranked, best);
  elements.results.hidden = false;
  if (shouldScroll) elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadRelease(rawInput) {
  let parsed;
  try {
    parsed = parseRepoInput(rawInput);
  } catch (error) {
    showStatus(t(error.message === "empty" ? "empty" : "invalid"), true);
    return;
  }

  elements.submit.disabled = true;
  elements.results.hidden = true;
  showStatus(t("loading"));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(buildReleaseApiUrl(parsed), {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      signal: controller.signal,
    });
    if (response.status === 404) throw new Error("notFound");
    if (response.status === 403 || response.status === 429) throw new Error("rateLimited");
    if (!response.ok) throw new Error("networkError");
    const release = await response.json();
    if (!Array.isArray(release.assets) || release.assets.length === 0) throw new Error("noAssets");
    state.release = release;
    state.parsed = parsed;
    elements.input.value = parsed.slug;
    history.replaceState(null, "", `?repo=${encodeURIComponent(parsed.slug)}`);
    hideStatus();
    renderResults();
  } catch (error) {
    const key = messages.en[error.message] ? error.message : "networkError";
    showStatus(t(key), true);
  } finally {
    clearTimeout(timeout);
    elements.submit.disabled = false;
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadRelease(elements.input.value);
});

elements.example.addEventListener("click", () => {
  elements.input.value = "configcrate/codex-titlebar-meter";
  loadRelease(elements.input.value);
});

elements.language.addEventListener("click", () => {
  state.language = state.language === "zh" ? "en" : "zh";
  localStorage.setItem("release-picker-language", state.language);
  applyLanguage();
});

elements.platform.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (button) selectTarget("platform", button.dataset.value);
});

elements.arch.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (button) selectTarget("arch", button.dataset.value);
});

applyLanguage();
detectDevice();

const initialRepo = new URLSearchParams(location.search).get("repo");
if (initialRepo) {
  elements.input.value = initialRepo;
  loadRelease(initialRepo);
}
