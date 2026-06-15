"""Capture sectioned screenshots of a project page for the intake template.

Strategy: prep a clone of the project page with all GSAP animations + preloader
neutralized, screenshot the full page via headless Chrome, then crop the
relevant section bands using PIL.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image


REPO = Path(__file__).resolve().parent.parent
SRC_PAGE = REPO / "projects" / "Inside-out.html"
TMP_PAGE = REPO / "projects" / "_screenshot.html"
OUT_DIR = REPO / "docs" / "screenshots"
FULL_PNG = OUT_DIR / "full-page.png"

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
VIEWPORT_W = 1440
VIEWPORT_H = 7000  # tall enough to fit the whole page

# Inject this style + script before </head> to render the page in a "settled"
# state — no preloader, no opacity-0 starts, no scroll-trigger gating.
INJECT = """
<style id="screenshot-overrides">
  * { animation: none !important; transition: none !important; }
  .mil-preloader, .mil-cursor, .mil-ball, .mil-progress-track { display: none !important; }
  body.mil-preloader-active { overflow: auto !important; }
  .mil-up, .mil-up-text, .mil-scale, .mil-appear,
  [class*="mil-up"], [class*="mil-reveal"] {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }
  .mil-image-frame, .mil-cover, .mil-image-frame img, .mil-cover img {
    opacity: 1 !important;
    transform: none !important;
  }
  /* The site hides body before preloader finishes — force visible */
  body { opacity: 1 !important; visibility: visible !important; }
</style>
<script>
  // Remove preloader class as soon as DOM is ready (before GSAP runs)
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.remove('mil-preloader-active');
    document.querySelectorAll('.mil-preloader, .mil-cursor, .mil-ball').forEach(function(el) {
      el.remove();
    });
  });
</script>
"""


def prep_temp_page() -> None:
    html = SRC_PAGE.read_text(encoding="utf-8")
    if "</head>" not in html:
        raise SystemExit("Could not find </head> in source page")
    html = html.replace("</head>", INJECT + "</head>", 1)
    TMP_PAGE.write_text(html, encoding="utf-8")


def take_screenshot() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={VIEWPORT_W},{VIEWPORT_H}",
        "--virtual-time-budget=4000",
        f"--screenshot={FULL_PNG}",
        "http://localhost:8000/projects/_screenshot.html",
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return FULL_PNG


def crop_sections() -> dict[str, Path]:
    """Crop the full screenshot into named bands matching intake sections."""
    img = Image.open(FULL_PNG)
    W, H = img.size

    # Find where actual content ends (last non-black row) by sampling alpha down the right column
    # Simple approach: trim trailing black/empty area.
    pixels = img.convert("RGB").load()
    last_content_y = H
    for y in range(H - 1, -1, -1):
        # sample 10 evenly spaced x positions
        if any(sum(pixels[x, y]) > 30 for x in range(50, W - 50, max(1, (W - 100) // 10))):
            last_content_y = y + 10
            break
    img = img.crop((0, 0, W, min(last_content_y, H)))
    H = img.height

    # Manual section bands (in source pixel coordinates) tuned to Inside-out layout.
    # Width = 1440. Sections (approximate y ranges):
    #   identity:   80  ..  680   (breadcrumbs + H1 + Read more arrow)
    #   facts:     1100 .. 1380   (Build type / Location / Status row + nearby)
    #   story:     1300 .. 1850   (description paragraph + small gap)
    #   visuals:    680 .. 2700   (hero image + gallery grid — broad)
    # Each crop is then resized to fit the docx column width.
    bands = {
        "01-identity": (0, 60, W, 720),
        "02-facts":    (0, 1080, W, 1420),
        "03-story":    (0, 1280, W, 1900),
        "04-visuals":  (0, 680, W, min(2900, H)),
    }
    out = {}
    for name, box in bands.items():
        # clamp
        x1, y1, x2, y2 = box
        y1 = max(0, min(y1, H))
        y2 = max(0, min(y2, H))
        if y2 - y1 < 40:
            print(f"  skip {name}: band too small (y1={y1} y2={y2})")
            continue
        crop = img.crop((x1, y1, x2, y2))
        # downscale to keep docx file small
        target_w = 1200
        ratio = target_w / crop.width
        crop = crop.resize((target_w, int(crop.height * ratio)), Image.LANCZOS)
        out_path = OUT_DIR / f"{name}.png"
        crop.save(out_path, optimize=True)
        out[name] = out_path
        print(f"  cropped {name}: {crop.size} -> {out_path.name}")
    return out


def cleanup() -> None:
    if TMP_PAGE.exists():
        TMP_PAGE.unlink()


def main() -> None:
    print("Prepping temp page...")
    prep_temp_page()
    try:
        print("Taking screenshot...")
        take_screenshot()
        print(f"Full screenshot: {FULL_PNG.relative_to(REPO)} ({FULL_PNG.stat().st_size//1024}KB)")
        print("Cropping sections...")
        crop_sections()
    finally:
        cleanup()
    print("Done.")


if __name__ == "__main__":
    main()
