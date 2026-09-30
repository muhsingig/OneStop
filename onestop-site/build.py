"""Assemble the OneStop site.
site/index.html  -> the Artifact page (no doctype/html/head/body; the host wraps it)
dist/            -> a standalone copy for local preview or a Vercel deploy
"""
import shutil
from pathlib import Path

root = Path(__file__).resolve().parent
src = root / "src"
read = lambda n: (src / n).read_text(encoding="utf-8")
page = (read("page.html")
        .replace("<!-- STYLE -->", "<style>\n" + read("style.css") + read("bits.css") + "\n</style>")
        .replace("<!-- APP -->", "<script>\n" + read("bits.js") + "\n</script>\n<script>\n" + read("app.js") + "\n</script>")
        .replace("<!-- SCENE -->", '<script type="module">\n' + read("scene.js") + "\n</script>"))

(root / "site").mkdir(exist_ok=True)
(root / "site" / "index.html").write_text(page, encoding="utf-8")

cut = page.index("<canvas")
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       + page[:cut] + "</head>\n<body>\n" + page[cut:] + "\n</body>\n</html>\n")
dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "index.html").write_text(doc, encoding="utf-8")
shutil.copytree(root / "assets", dist / "assets", dirs_exist_ok=True)
print(f"site/index.html {len(page)/1024:.0f} KB · dist/ ready")
