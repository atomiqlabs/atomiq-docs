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
