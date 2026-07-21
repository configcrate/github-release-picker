from __future__ import annotations

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1080
HEIGHT = 1440
FPS = 24
DURATION = 18.4
FRAME_COUNT = round(FPS * DURATION)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "video"
BUILD_DIR = ROOT / "build"
VIDEO = OUTPUT_DIR / "github-release-picker-promo-zh.mp4"
COVER = OUTPUT_DIR / "github-release-picker-cover-3x4-zh.png"
CONTACT_SHEET = BUILD_DIR / "video-contact-sheet.png"

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
FONT_MONO = Path(r"C:\Windows\Fonts\consola.ttf")

WHITE = (244, 247, 252)
MUTED = (157, 174, 198)
FAINT = (99, 119, 147)
BLUE = (79, 157, 255)
BLUE_DARK = (26, 74, 137)
CYAN = (94, 234, 212)
CYAN_DARK = (18, 67, 67)
GREEN = (103, 221, 155)
YELLOW = (246, 200, 95)
RED = (255, 116, 126)
PANEL = (19, 29, 45)
PANEL_2 = (26, 39, 59)
LINE = (55, 77, 107)


def font(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_MONO if mono else FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(str(path), size=size)


F22 = font(22)
F24 = font(24)
F26 = font(26)
F28 = font(28)
F30 = font(30)
F32 = font(32)
F34B = font(34, True)
F38B = font(38, True)
F42B = font(42, True)
F48B = font(48, True)
F54B = font(54, True)
F62B = font(62, True)
F70B = font(70, True)
F78B = font(78, True)
F30M = font(30, mono=True)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def smooth(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def progress(t: float, start: float, end: float) -> float:
    return clamp((t - start) / max(end - start, 0.001))


def fade(t: float, start: float, end: float, edge: float = 0.34) -> float:
    return smooth(progress(t, start, start + edge)) * (1 - smooth(progress(t, end - edge, end)))


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, face, fill, spacing: int = 7) -> None:
    bounds = draw.multiline_textbbox((0, 0), text, font=face, spacing=spacing, align="center")
    x = (WIDTH - (bounds[2] - bounds[0])) // 2
    draw.multiline_text((x, y), text, font=face, fill=fill, spacing=spacing, align="center")


def background() -> Image.Image:
    base = Image.new("RGB", (WIDTH, HEIGHT), (8, 13, 22)).convert("RGBA")
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse((560, -310, 1390, 520), fill=(47, 129, 247, 49))
    draw.ellipse((-500, 870, 420, 1790), fill=(25, 195, 164, 37))
    return Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(140)))


BACKGROUND = background()


def layer() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def composite(frame: Image.Image, top: Image.Image, alpha: float = 1.0) -> None:
    if alpha < 0.999:
        top = top.copy()
        top.putalpha(top.getchannel("A").point(lambda p: int(p * clamp(alpha))))
    frame.alpha_composite(top)


def draw_cube(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 48) -> None:
    rounded(draw, (x, y, x + size, y + size), 13, (18, 35, 59), (62, 126, 207), 2)
    cx, cy = x + size // 2, y + size // 2
    points = [(cx, y + 10), (x + size - 10, y + 17), (cx, y + 25), (x + 10, y + 17)]
    draw.line(points + [points[0]], fill=BLUE, width=3, joint="curve")
    draw.line((cx, y + 25, cx, y + 39), fill=BLUE, width=3)
    draw.line((x + 10, y + 17, x + 10, y + 32, cx, y + 39), fill=BLUE, width=3)
    draw.line((x + size - 10, y + 17, x + size - 10, y + 32, cx, y + 39), fill=BLUE, width=3)


def brand(draw: ImageDraw.ImageDraw) -> None:
    draw_cube(draw, 54, 46)
    draw.text((119, 54), "GITHUB RELEASE PICKER", font=F24, fill=(204, 215, 230))
    draw.text((831, 56), "CONFIGCRATE", font=F22, fill=FAINT)


def release_row(draw: ImageDraw.ImageDraw, y: int, name: str, color, tag: str, appear: float = 1.0) -> None:
    x = 78 + int((1 - appear) * 100)
    rounded(draw, (x, y, 1002, y + 100), 18, PANEL, LINE, 2)
    draw.ellipse((x + 25, y + 36, x + 53, y + 64), fill=tuple(int(c * 0.25) for c in color), outline=color, width=3)
    draw.text((x + 76, y + 25), name, font=F30M, fill=WHITE)
    draw.text((x + 76, y + 64), tag, font=F22, fill=color)


def scene_problem(t: float, frame: Image.Image) -> None:
    alpha = fade(t, 0, 3.45, 0.22)
    if alpha <= 0:
        return
    top, draw = layer()
    brand(draw)
    enter = ease_out(progress(t, 0, 0.65))
    centered(draw, "GitHub 下载软件", 170 + int((1 - enter) * 55), F70B, WHITE)
    centered(draw, "到底该选哪个？", 270 + int((1 - enter) * 55), F78B, RED)
    centered(draw, "一个发行版，十几个看不懂的文件", 390, F34B, MUTED)

    rows = [
        ("app-v2.4.1-windows-amd64.exe", BLUE, "Windows · x64"),
        ("app-v2.4.1-darwin-arm64.dmg", CYAN, "macOS · ARM64"),
        ("app-v2.4.1-linux-x86_64.tar.gz", GREEN, "Linux · x64"),
        ("checksums.txt", YELLOW, "SHA256"),
        ("Source code.zip", FAINT, "Source code"),
    ]
    for index, row in enumerate(rows):
        reveal = ease_out(progress(t, 0.55 + index * 0.18, 1.15 + index * 0.18))
        release_row(draw, 510 + index * 125, *row, reveal)

    q = smooth(progress(t, 2.1, 2.6))
    if q:
        radius = int(30 + 9 * math.sin(t * 8))
        draw.ellipse((860 - radius, 1100 - radius, 860 + radius, 1100 + radius), fill=(93, 33, 44), outline=RED, width=4)
        draw.text((842, 1063), "?", font=F54B, fill=WHITE)
    composite(frame, top, alpha)


def pill(draw: ImageDraw.ImageDraw, center_x: int, y: int, text: str, color, face=F42B) -> None:
    box = draw.textbbox((0, 0), text, font=face)
    width = box[2] - box[0] + 70
    rounded(draw, (center_x - width // 2, y, center_x + width // 2, y + 76), 38, tuple(int(c * 0.18) for c in color), color, 2)
    draw.text((center_x - (box[2] - box[0]) // 2, y + 11), text, font=face, fill=color)


def scene_terms(t: float, frame: Image.Image) -> None:
    alpha = fade(t, 3.50, 6.35, 0.22)
    if alpha <= 0:
        return
    top, draw = layer()
    brand(draw)
    centered(draw, "这些都是什么？", 180, F70B, WHITE)
    terms = [("amd64", BLUE), ("ARM64", CYAN), ("darwin", YELLOW)]
    for index, (text, color) in enumerate(terms):
        y = 355 + index * 170
        p = ease_out(progress(t, 3.7 + index * 0.2, 4.35 + index * 0.2))
        pill(draw, 540 + int((1 - p) * (90 if index % 2 == 0 else -90)), y, text, color)

    cards = [
        ("amd64 / x64", "大多数 Intel、AMD 电脑", BLUE),
        ("ARM64", "Apple 芯片和部分 ARM 设备", CYAN),
        ("darwin", "它其实代表 macOS", YELLOW),
    ]
    for index, (label, copy, color) in enumerate(cards):
        y = 875 + index * 115
        draw.ellipse((116, y + 20, 138, y + 42), fill=color)
        draw.text((165, y), label, font=F34B, fill=WHITE)
        draw.text((430, y + 4), copy, font=F28, fill=MUTED)
    centered(draw, "普通用户不该先学会这些，才能下载软件", 1265, F32, MUTED)
    composite(frame, top, alpha)


def selector(draw: ImageDraw.ImageDraw, x: int, y: int, labels: list[str], selected: int, width: int) -> None:
    rounded(draw, (x, y, x + width, y + 66), 13, (10, 17, 27), LINE, 2)
    item_width = width // len(labels)
    for index, label in enumerate(labels):
        if index == selected:
            rounded(draw, (x + index * item_width + 5, y + 5, x + (index + 1) * item_width - 5, y + 61), 10, (39, 58, 88))
        box = draw.textbbox((0, 0), label, font=F24)
        tx = x + index * item_width + (item_width - (box[2] - box[0])) // 2
        draw.text((tx, y + 17), label, font=F24, fill=WHITE if index == selected else MUTED)


def recommended_card(draw: ImageDraw.ImageDraw, y: int, opacity: float = 1.0) -> Image.Image:
    card, cdraw = layer()
    rounded(cdraw, (70, y, 1010, y + 385), 28, (19, 48, 58), (58, 153, 144), 3)
    rounded(cdraw, (103, y + 28, 285, y + 76), 24, CYAN_DARK)
    cdraw.text((128, y + 38), "推荐你下载", font=F24, fill=CYAN)
    cdraw.text((817, y + 41), "高可信匹配", font=F22, fill=MUTED)
    rounded(cdraw, (105, y + 105, 175, y + 175), 18, (24, 70, 72), (54, 137, 132), 2)
    cdraw.text((128, y + 121), "↓", font=F34B, fill=CYAN)
    cdraw.text((200, y + 104), "codex-titlebar-meter-v0.1.1-", font=F28, fill=WHITE)
    cdraw.text((200, y + 142), "windows-x64.zip", font=F30M, fill=WHITE)
    cdraw.text((200, y + 183), "255.6 KB · 适用于 Windows · 匹配 x64", font=F22, fill=MUTED)
    rounded(cdraw, (104, y + 242, 976, y + 331), 18, (41, 132, 235))
    centered_x = 540
    text = "从 GitHub 直接下载"
    box = cdraw.textbbox((0, 0), text, font=F34B)
    cdraw.text((centered_x - (box[2] - box[0]) // 2, y + 265), text, font=F34B, fill=WHITE)
    if opacity < 1:
        card.putalpha(card.getchannel("A").point(lambda p: int(p * opacity)))
    return card


def scene_tool(t: float, frame: Image.Image) -> None:
    alpha = fade(t, 6.40, 12.10, 0.22)
    if alpha <= 0:
        return
    top, draw = layer()
    brand(draw)
    centered(draw, "粘贴项目链接", 135, F62B, WHITE)
    centered(draw, "剩下的交给它", 220, F54B, CYAN)

    rounded(draw, (70, 345, 1010, 455), 24, PANEL, (71, 129, 198), 3)
    draw.text((112, 376), "configcrate/codex-titlebar-meter", font=F30M, fill=WHITE)
    rounded(draw, (775, 362, 982, 438), 16, (42, 128, 235))
    draw.text((809, 380), "帮我选择", font=F30, fill=WHITE)

    rounded(draw, (70, 490, 1010, 660), 24, PANEL, LINE, 2)
    draw.text((105, 523), "你的设备", font=F30, fill=WHITE)
    draw.text((105, 567), "下载前可以随时修改", font=F22, fill=MUTED)
    selector(draw, 475, 515, ["Windows", "macOS", "Linux"], 0, 500)
    selector(draw, 655, 588, ["x64", "ARM64"], 0, 320)

    loading = progress(t, 7.1, 8.25)
    if loading < 1:
        draw.text((85, 724), "正在比较发行文件……", font=F26, fill=MUTED)
        rounded(draw, (85, 775, 995, 790), 8, (20, 35, 53))
        draw.rounded_rectangle((85, 775, 85 + int(910 * ease_out(loading)), 790), radius=8, fill=BLUE)
    else:
        reveal = ease_out(progress(t, 8.15, 8.75))
        result = recommended_card(draw, 725 + int((1 - reveal) * 80), reveal)
        top.alpha_composite(result)

    cursor_p = ease_out(progress(t, 6.65, 7.2))
    if cursor_p > 0:
        cx = int(950 + (895 - 950) * cursor_p)
        cy = int(540 + (410 - 540) * cursor_p)
        draw.polygon([(cx, cy), (cx + 15, cy + 48), (cx + 27, cy + 32), (cx + 46, cy + 48), (cx + 56, cy + 38), (cx + 35, cy + 20)], fill=WHITE, outline=(5, 9, 15))
    centered(draw, "不安装 · 不登录 · 不需要 API Key", 1285, F30, MUTED)
    composite(frame, top, alpha)


def scene_cautious(t: float, frame: Image.Image) -> None:
    alpha = fade(t, 12.15, 15.10, 0.22)
    if alpha <= 0:
        return
    top, draw = layer()
    brand(draw)
    centered(draw, "选不准时", 175, F62B, WHITE)
    centered(draw, "它也不会乱猜", 255, F70B, YELLOW)

    rounded(draw, (75, 430, 1005, 650), 28, PANEL, LINE, 2)
    draw.text((115, 475), "你的设备", font=F30, fill=WHITE)
    selector(draw, 365, 470, ["Windows", "macOS", "Linux"], 1, 600)
    selector(draw, 645, 555, ["x64", "ARM64"], 1, 320)

    p = ease_out(progress(t, 12.8, 13.5))
    y = 760 + int((1 - p) * 65)
    rounded(draw, (75, y, 1005, y + 300), 28, (51, 43, 28), (151, 119, 55), 3)
    draw.ellipse((115, y + 55, 181, y + 121), fill=(85, 68, 34), outline=YELLOW, width=3)
    draw.text((137, y + 65), "?", font=F38B, fill=YELLOW)
    draw.text((210, y + 45), "暂时无法安全地替你选择", font=F38B, fill=WHITE)
    draw.text((210, y + 110), "没有适合 macOS ARM64 的明确文件", font=F28, fill=MUTED)
    draw.text((210, y + 160), "请查看项目说明或进入发行版确认", font=F28, fill=MUTED)
    centered(draw, "诚实地说不知道，比推荐错文件更重要", 1180, F34B, MUTED)
    composite(frame, top, alpha)


def scene_final(t: float, frame: Image.Image) -> None:
    alpha = fade(t, 15.15, 18.4, 0.22)
    if alpha <= 0:
        return
    top, draw = layer()
    p = ease_out(progress(t, 15.35, 16.0))
    draw_cube(draw, 466, 160 + int((1 - p) * 50), 148)
    centered(draw, "GitHub 下载选择器", 365, F70B, WHITE)
    centered(draw, "粘贴链接，直接告诉你下载哪个", 470, F42B, CYAN)

    labels = [("中英文", BLUE), ("无需登录", CYAN), ("直接下载", GREEN)]
    x_positions = [255, 540, 825]
    for (label, color), x in zip(labels, x_positions):
        pill(draw, x, 625, label, color, F28)

    rounded(draw, (95, 810, 985, 1035), 30, PANEL, LINE, 2)
    draw.text((140, 850), "在线使用", font=F26, fill=MUTED)
    draw.text((140, 900), "configcrate.github.io/", font=F34B, fill=WHITE)
    draw.text((140, 946), "github-release-picker", font=F38B, fill=BLUE)
    centered(draw, "GitHub: configcrate/github-release-picker", 1135, F30, MUTED)
    centered(draw, "configcrate.com", 1270, F30, FAINT)
    composite(frame, top, alpha)


def render_frame(t: float) -> Image.Image:
    frame = BACKGROUND.copy()
    scene_problem(t, frame)
    scene_terms(t, frame)
    scene_tool(t, frame)
    scene_cautious(t, frame)
    scene_final(t, frame)
    return frame.convert("RGB")


def cover_image() -> Image.Image:
    frame = BACKGROUND.copy()
    top, draw = layer()
    brand(draw)
    centered(draw, "GitHub 文件太多？", 170, F70B, WHITE)
    centered(draw, "直接告诉你下载哪个", 265, F62B, CYAN)
    rounded(draw, (70, 410, 1010, 525), 24, PANEL, (71, 129, 198), 3)
    draw.text((112, 447), "configcrate/codex-titlebar-meter", font=F30M, fill=WHITE)
    selector(draw, 70, 570, ["Windows", "macOS", "Linux"], 0, 580)
    selector(draw, 685, 570, ["x64", "ARM64"], 0, 325)
    top.alpha_composite(recommended_card(draw, 705))
    rounded(draw, (155, 1205, 925, 1300), 48, (20, 48, 60), (52, 142, 138), 2)
    text = "开源 · 中英文 · 无需登录"
    box = draw.textbbox((0, 0), text, font=F34B)
    draw.text((540 - (box[2] - box[0]) // 2, 1230), text, font=F34B, fill=CYAN)
    composite(frame, top)
    return frame.convert("RGB")


def render_video() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(VIDEO),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    for index in range(FRAME_COUNT):
        process.stdin.write(render_frame(index / FPS).tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError("ffmpeg failed")

    cover_image().save(COVER, quality=95)
    times = [0.8, 3.0, 4.7, 7.4, 9.4, 13.5, 16.6, 17.6]
    thumbs = [render_frame(value).resize((270, 360), Image.Resampling.LANCZOS) for value in times]
    sheet = Image.new("RGB", (1080, 720), (8, 13, 22))
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % 4) * 270, (index // 4) * 360))
    sheet.save(CONTACT_SHEET, quality=92)


if __name__ == "__main__":
    render_video()
    print(VIDEO)
    print(COVER)
    print(CONTACT_SHEET)
