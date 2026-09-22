# Rough Squarespace blog HTML -> Markdown. One-time helper for Phase 5 porting.
import re, sys, html
src = open(sys.argv[1]).read()
m = re.search(r'<div class="blog-item-content-wrapper">(.*?)<footer', src, re.S) or re.search(r'<article.*?>(.*?)</article>', src, re.S)
body = m.group(1)
body = re.sub(r'<script.*?</script>|<style.*?</style>', '', body, flags=re.S)
def a(m):
    href = re.search(r'href="([^"]*)"', m.group(1)); txt = re.sub(r'<[^>]+>', '', m.group(2)).strip()
    return f'[{txt}]({html.unescape(href.group(1))})' if href and txt else txt
body = re.sub(r'<a([^>]*)>(.*?)</a>', a, body, flags=re.S)
body = re.sub(r'<(strong|b)>(.*?)</\1>', r'**\2**', body, flags=re.S)
body = re.sub(r'<(em|i)>(.*?)</\1>', r'*\2*', body, flags=re.S)
for n in '234': body = re.sub(rf'<h{n}[^>]*>(.*?)</h{n}>', lambda m: f'\n\n{"#"*int(n)} ' + re.sub(r"<[^>]+>","",m.group(1)).strip() + '\n\n', body, flags=re.S)
body = re.sub(r'<h1[^>]*>.*?</h1>', '', body, flags=re.S)
body = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '\n- ' + re.sub(r"<[^>]+>","",m.group(1)).strip(), body, flags=re.S)
body = re.sub(r'<br\s*/?>', '  \n', body)
body = re.sub(r'</p>|</div>|</ul>', '\n\n', body)
body = re.sub(r'<[^>]+>', '', body)
body = html.unescape(body)
body = re.sub(r'[ \t]+', ' ', body); body = re.sub(r'\n[ \t]+', '\n', body); body = re.sub(r'\n{3,}', '\n\n', body)
print(body.strip())
