#!/bin/sh
# Convert every GIF under src/assets/work/<project>/ → public/video/<project>/<name>.{mp4,webm,jpg}
# Usage: scripts/gif2mp4.sh            (all)   |   scripts/gif2mp4.sh merch   (one project)
set -e
for gif in src/assets/work/${1:-*}/*.gif; do
  [ -f "$gif" ] || continue
  proj=$(basename "$(dirname "$gif")")
  name=$(basename "$gif" .gif | sed -E 's/^[0-9]+-//; s/[^a-z0-9]+/-/g; s/-+$//')
  out="public/video/$proj/$name"
  mkdir -p "public/video/$proj"
  [ -f "$out.mp4" ] && { echo "skip $out"; continue; }
  vf="scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p"
  ffmpeg -loglevel error -y -i "$gif" -vf "$vf" -c:v libx264 -preset slow -crf 24 -movflags +faststart -an "$out.mp4"
  ffmpeg -loglevel error -y -i "$gif" -vf "$vf" -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -an "$out.webm"
  ffmpeg -loglevel error -y -i "$gif" -vf "$vf" -frames:v 1 -q:v 4 "$out.jpg"
  printf '%-60s gif %6dK → mp4 %5dK  webm %5dK\n' "$out" $(( $(stat -f%z "$gif")/1024 )) $(( $(stat -f%z "$out.mp4")/1024 )) $(( $(stat -f%z "$out.webm")/1024 ))
done
