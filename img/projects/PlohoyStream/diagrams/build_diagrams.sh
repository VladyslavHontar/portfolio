#!/bin/sh
# Render each .puml twice — once per theme — so the diagrams match the page in
# light and dark mode. The .puml files use bare colour tokens (FILL, STROKE,
# TEXT, MUTED) that get substituted here.
#
#   ./build_diagrams.sh        (needs plantuml on PATH)
set -e
cd "$(dirname "$0")"

render() { # name, fill, stroke, text, muted
  for src in *.puml; do
    base="${src%.puml}"
    # the name after @startuml would override the output filename, so drop it
    sed -e "s/FILL/$2/g" -e "s/STROKE/$3/g" -e "s/TEXT/$4/g" -e "s/MUTED/$5/g" \
        -e "s/^@startuml .*/@startuml/" \
      "$src" > "/tmp/${base}-$1.puml"
    plantuml -tsvg -o "$PWD" "/tmp/${base}-$1.puml"
    echo "  ${base}-$1.svg"
  done
}

echo "light:"; render light '#fafafa' '#5a5a5a' '#1b1b1b' '#6d6d6d'
echo "dark:";  render dark  '#1b1d1f' '#8b8b8b' '#e6e4e1' '#9b9b9b'
