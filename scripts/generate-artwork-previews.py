#!/usr/bin/env python3
"""Generate display-only WebP previews without altering source artwork.

Run from the repository root with Pillow installed. These public previews are
not the digital downloads that a future shop should deliver to customers.
"""
from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
INPUT_DIRS = (Path('assets/photos'), Path('assets/uploads'), Path('assets/gabzilla'))
OUTPUT_DIR = Path('assets/previews')
MAX_EDGE = 1200
WEBP_QUALITY = 78
SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp'}


def build() -> None:
    entries: dict[str, str] = {}
    for folder in INPUT_DIRS:
        if not (ROOT / folder).is_dir():
            continue
        for source in sorted((ROOT / folder).iterdir()):
            if not source.is_file() or source.suffix.lower() not in SUPPORTED:
                continue
            destination = ROOT / OUTPUT_DIR / folder.name / (source.stem + '.webp')
            destination.parent.mkdir(parents=True, exist_ok=True)
            with Image.open(source) as original:
                # Keep composition, aspect ratio and alpha, but strip EXIF/GPS.
                im = ImageOps.exif_transpose(original)
                if im.mode in ('P', 'LA', 'RGBA') or 'transparency' in im.info:
                    im = im.convert('RGBA')
                else:
                    im = im.convert('RGB')
                im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
                im.save(destination, 'WEBP', quality=WEBP_QUALITY, method=6)
                print(f'{source.relative_to(ROOT)}: {original.size} -> {im.size}, {destination.relative_to(ROOT)}')
            entries[source.relative_to(ROOT).as_posix()] = destination.relative_to(ROOT).as_posix()

    manifest = {'max_edge': MAX_EDGE, 'quality': WEBP_QUALITY, 'files': entries}
    (ROOT / OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    (ROOT / OUTPUT_DIR / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print(f'Generated {len(entries)} screen-only previews; source files unchanged.')


if __name__ == '__main__':
    build()
