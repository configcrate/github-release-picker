import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReleaseApiUrl,
  formatBytes,
  inspectAssetName,
  parseRepoInput,
  rankAssets,
} from "../src/release-picker.js";

test("parses repo slugs and GitHub URLs", () => {
  assert.deepEqual(parseRepoInput("configcrate/codex-titlebar-meter"), {
    owner: "configcrate",
    repo: "codex-titlebar-meter",
    tag: null,
    slug: "configcrate/codex-titlebar-meter",
  });
  assert.equal(parseRepoInput("https://github.com/sharkdp/bat/releases/latest").slug, "sharkdp/bat");
  assert.equal(parseRepoInput("https://github.com/acme/tool/releases/tag/v1.2.0").tag, "v1.2.0");
  assert.throws(() => parseRepoInput("https://example.com/acme/tool"), /not-github/);
});

test("builds latest and tagged API URLs", () => {
  assert.equal(
    buildReleaseApiUrl(parseRepoInput("owner/repo")),
    "https://api.github.com/repos/owner/repo/releases/latest",
  );
  assert.equal(
    buildReleaseApiUrl(parseRepoInput("https://github.com/owner/repo/releases/tag/release%2F1")),
    "https://api.github.com/repos/owner/repo/releases/tags/release%2F1",
  );
});

test("does not confuse darwin with Windows", () => {
  const inspected = inspectAssetName("tool-v1.0-darwin-amd64.zip");
  assert.deepEqual(inspected.platforms, ["macos"]);
  assert.deepEqual(inspected.architectures, ["x64"]);
});

test("does not confuse x86_64 with 32-bit x86", () => {
  const inspected = inspectAssetName("tool-windows-x86_64.zip");
  assert.deepEqual(inspected.architectures, ["x64"]);
});

test("prefers the matching Windows installer", () => {
  const assets = [
    { name: "tool-v1.0-linux-amd64.tar.gz", download_count: 80 },
    { name: "tool-v1.0-windows-arm64.zip", download_count: 30 },
    { name: "tool-v1.0-windows-amd64.zip", download_count: 10 },
    { name: "checksums.txt", download_count: 200 },
  ];
  const result = rankAssets(assets, { platform: "windows", arch: "x64" });
  assert.equal(result.best.asset.name, "tool-v1.0-windows-amd64.zip");
  assert.equal(result.confidence, "high");
  assert.equal(result.ranked.find((item) => item.asset.name === "checksums.txt").eligible, false);
});

test("prefers a macOS universal package for Apple Silicon", () => {
  const assets = [
    { name: "App-macos-x64.dmg" },
    { name: "App-macos-universal.dmg" },
    { name: "App-linux-arm64.AppImage" },
  ];
  assert.equal(
    rankAssets(assets, { platform: "macos", arch: "arm64" }).best.asset.name,
    "App-macos-universal.dmg",
  );
});

test("formats file sizes", () => {
  assert.equal(formatBytes(1024), "1 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5 MB");
});
