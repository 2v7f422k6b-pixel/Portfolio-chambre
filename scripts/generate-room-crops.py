"""Remove transparent padding only; keep every visible source pixel and SVG position."""
import hashlib
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/room-compact'
OUT.mkdir(exist_ok=True)
html_path = ROOT / 'index.html'
html = html_path.read_text()
manifest = []

def compact(match):
    tag = match.group(0)
    source = re.search(r'data-resource-href="assets/(?:room-compact/)?(IMG_\d+\.png)"', tag)
    if not source or 'data-resource-mode="play"' not in tag:
        return tag
    path = ROOT / 'assets' / source[1]
    image = Image.open(path).convert('RGBA')
    if image.size != (3072, 1732):
        return tag
    bounds = image.getchannel('A').getbbox()
    if not bounds:
        return tag
    x, y, right, bottom = bounds
    box = (max(0, x-2), max(0, y-2), min(image.width, right+2), min(image.height, bottom+2))
    cropped = image.crop(box)
    target = OUT / source[1]
    cropped.save(target, optimize=True)
    # Verify decoding the saved PNG preserves every RGBA pixel, including alpha.
    assert Image.open(target).convert('RGBA').tobytes() == cropped.tobytes()
    scale_x, scale_y = 1670/image.width, 942/image.height
    values = dict(x=box[0]*scale_x, y=box[1]*scale_y,
                  width=cropped.width*scale_x, height=cropped.height*scale_y)
    for key, value in values.items():
        tag = re.sub(r'\s'+key+r'="[^"]*"', '', tag)
        tag = tag.replace('/>', f' {key}="{value:.12f}"/>')
    tag = tag.replace(source[0], f'data-resource-href="assets/room-compact/{source[1]}"')
    manifest.append(dict(source='assets/'+source[1], target='assets/room-compact/'+source[1],
                         source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                         box=box, original_size=list(image.size), size=list(cropped.size)))
    return tag

html = re.sub(r'<image\b[^>]+/>', compact, html)
html_path.write_text(html)
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
original = sum(w*h for row in manifest for w,h in [row['original_size']])
cropped = sum(w*h for row in manifest for w,h in [row['size']])
print(json.dumps(dict(images=len(manifest), original_pixels=original, cropped_pixels=cropped,
                      original_bytes=sum((ROOT/r['source']).stat().st_size for r in manifest),
                      cropped_bytes=sum((ROOT/r['target']).stat().st_size for r in manifest))))
