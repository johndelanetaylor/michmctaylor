#!/bin/sh
# Contact sheet of a project's assets → raw/_shots/sheet-<slug>.png
slug=$1; dir=src/assets/work/$slug; out=raw/_shots/sheet-$slug.html
{ echo '<style>body{margin:0;background:#fff;font:12px monospace}div{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px}figure{margin:0}img{width:100%;height:220px;object-fit:contain;background:#eee}figcaption{white-space:nowrap;overflow:hidden}</style><div>';
  for f in "$dir"/*.{jpg,jpeg,png,gif}; do [ -f "$f" ] || continue; echo "<figure><img src=\"$PWD/$f\"><figcaption>$(basename "$f")</figcaption></figure>"; done; echo '</div>'; } > "$out"
n=$(ls "$dir"/*.{jpg,jpeg,png,gif} 2>/dev/null | wc -l); rows=$(( (n + 4) / 5 )); h=$(( rows * 250 + 20 ))
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=1600,$h --virtual-time-budget=5000 --screenshot="raw/_shots/sheet-$slug.png" "file://$PWD/$out" 2>/dev/null
echo "raw/_shots/sheet-$slug.png ($n imgs)"
