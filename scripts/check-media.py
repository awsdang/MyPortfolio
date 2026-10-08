"""Audit the explicit screenshot requirements without browser dependencies."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class MediaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.shots = []
        self.images = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a" and "data-shot" in attrs:
            self.shots.append(attrs)
        if tag == "img" and attrs.get("src"):
            self.images.append(attrs["src"])


manifest = json.loads((ROOT / "assets/project-media.json").read_text())
home = MediaParser()
home.feed((ROOT / "index.html").read_text())
assert len(home.shots) == 2 * len(manifest), "Homepage requires two screens per project"
total = 0
for project, screens in manifest.items():
    assert len(screens) >= 10, f"{project}: fewer than ten screens"
    case = MediaParser()
    page = ROOT / "work" / f"{project}.html"
    case.feed(page.read_text())
    assert len(case.shots) == len(screens), f"{project}: case gallery count mismatch"
    assert {item["href"] for item in case.shots} == {
        "../" + screen["src"] for screen in screens
    }, f"{project}: case gallery differs from the media manifest"
    assert sum(f"/shots/{project}/" in item["href"] for item in home.shots) == 2
    hashes = set()
    for screen in screens:
        path = ROOT / screen["src"]
        assert path.is_file(), path
        assert screen["width"] > 0 and screen["height"] > 0
        assert screen["title"] and screen["caption"] and screen["source"]
        hashes.add(hashlib.sha256(path.read_bytes()).hexdigest())
    assert len(hashes) == len(screens), f"{project}: duplicate images"
    for src in case.images:
        if not src.startswith(("https:", "http:", "data:")):
            assert (page.parent / src).resolve().is_file(), src
    total += len(screens)
    print(f"{project}: 2 homepage previews; {len(screens)} distinct case screens")
for src in home.images:
    if not src.startswith(("https:", "http:", "data:")):
        assert (ROOT / src).is_file(), src
video = json.loads((ROOT / "assets/media/intro.json").read_text())
if video["src"]:
    assert (ROOT / video["src"]).is_file(), "Configured intro recording is missing"
    for track in video.get("tracks", []):
        assert (ROOT / track["src"]).is_file(), "Configured captions are missing"
print(f"{total} project screens validated.")
print("Talking video: configured" if video["src"] else "Talking video: awaiting actual recording; typographic fallback active")
