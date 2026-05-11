#!/bin/bash

DRAWIO='/Applications/draw.io.app/Contents/MacOS/draw.io'
OUTPUT_DIR='../static/img'

$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/utxo-chain.svg" utxo-chain.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/frombtc-diagram.svg" frombtc-diagram.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/frombtcln-diagram.svg" frombtcln-diagram.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/tobtc-diagram.svg" tobtc-diagram.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/tobtcln-diagram.svg" tobtcln-diagram.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/frombtc-new-swap-flow-diagram.svg" frombtc-new-swap-flow-diagram.drawio
$DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/nostr-frombtcln-diagram.svg" nostr-frombtcln-diagram.drawio

# for file in *.drawio; do
#   name="${file%.drawio}"
#   $DRAWIO -x -b 20 -f svg -o "$OUTPUT_DIR/$name.svg" "$file"
# done

# for mermaid files:
# PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
# mmdc -i diagrams/rest-api-swap-lifecycle.mmd \
#         -o static/img/rest-api/swap-lifecycle.svg -b transparent

# The PUPPETEER_EXECUTABLE_PATH is needed because mmdc's bundled Chrome wasn't installed — it falls back to your system Chrome. If you'd rather not set the env var each time, run npx
# puppeteer browsers install chrome-headless-shell once.
