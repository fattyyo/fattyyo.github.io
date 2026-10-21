"""把作品集放到網站根目錄、部落格放在 /blog/，並產生根目錄的 404 頁。

用法：python3 assemble.py <作品集資料夾> <輸出資料夾（裡面已經有 blog/）>
"""
import shutil
import sys
from pathlib import Path

portfolio, out = Path(sys.argv[1]), Path(sys.argv[2])
SKIP = {'.git', '.github', '.gitignore', 'README.md', 'deploy.sh'}

for item in portfolio.iterdir():
    if item.name in SKIP:
        continue
    dest = out / item.name
    if item.is_dir():
        shutil.copytree(item, dest, dirs_exist_ok=True)
    else:
        shutil.copy2(item, dest)

# GitHub Pages 全站只認根目錄的 404.html。沿用部落格的 404 外觀，
# 並把舊網址轉過去：部落格以前在根目錄（/p/…、/tags/…），作品集以前在 /portfolio/
REDIRECT = """<script>(function () {
  var p = location.pathname, rest = location.search + location.hash;
  if (/^\\/(p|tags|post|categories|about|page)(\\/|$)/.test(p) || p === '/index.xml') {
    location.replace('/blog' + p + rest);
  } else if (/^\\/portfolio(\\/|$)/.test(p)) {
    location.replace('/' + p.replace(/^\\/portfolio\\/?/, '') + rest);
  }
})();</script>"""
html = (out / 'blog' / '404.html').read_text(encoding='utf-8')
(out / '404.html').write_text(html.replace('<head>', '<head>' + REDIRECT, 1), encoding='utf-8')
print('assembled:', sorted(p.name for p in out.iterdir()))
