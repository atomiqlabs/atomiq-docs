#!/usr/bin/env bash
#
# Extracts all deployed contract addresses from atomiq-chain-* source files.
# For each address, prints the source file, line number, network, contract name, and address.
#
# Usage: ./scripts/extract-contract-addresses.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Project root is the parent of atomiq-docs (which contains this script)
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

BOLD="\033[1m"
DIM="\033[2m"
RESET="\033[0m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"

# Helper: extract a 0x address from a line
extract_addr() {
    echo "$1" | sed -n 's/.*"\(0x[0-9a-fA-F]\{20,\}\)".*/\1/p'
}

# ─────────────────────────────────────────────────────────────────────────────
# Starknet
# ─────────────────────────────────────────────────────────────────────────────

STARKNET_BASE="$PROJECT_ROOT/atomiq-chain-starknet"

echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  STARKNET CONTRACT ADDRESSES${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo ""

# --- BTC Relay ---
REL="src/starknet/btcrelay/StarknetBtcRelay.ts"
FILE="$STARKNET_BASE/$REL"
echo -e "${CYAN}BTC Relay${RESET}  ${DIM}$REL${RESET}"
grep -n 'BitcoinNetwork\.' "$FILE" | grep '"0x' | while IFS= read -r line; do
    LINENO=$(echo "$line" | cut -d: -f1)
    NETWORK=$(echo "$line" | sed -n 's/.*BitcoinNetwork\.\([A-Z0-9]*\).*/\1/p')
    ADDR=$(extract_addr "$line")
    [ -n "$ADDR" ] && printf "  %-12s %s  ${DIM}(L%s)${RESET}\n" "$NETWORK" "$ADDR" "$LINENO"
done
echo ""

# --- Swap Contract (Escrow Manager) ---
REL="src/starknet/swaps/StarknetSwapContract.ts"
FILE="$STARKNET_BASE/$REL"
echo -e "${CYAN}Escrow Manager${RESET}  ${DIM}$REL${RESET}"

echo -e "  ${GREEN}Contract:${RESET}"
grep -n 'swapContractAddreses' "$FILE" -A5 | grep '"0x' | while IFS= read -r line; do
    LINENO=$(echo "$line" | sed -n 's/^\([0-9]*\)[:-].*/\1/p')
    ADDR=$(extract_addr "$line")
    if echo "$line" | grep -q 'SN_SEPOLIA'; then
        NETWORK="SEPOLIA"
    elif echo "$line" | grep -q 'SN_MAIN'; then
        NETWORK="MAINNET"
    else
        NETWORK="?"
    fi
    [ -n "$ADDR" ] && printf "    %-12s %s  ${DIM}(L%s)${RESET}\n" "$NETWORK" "$ADDR" "$LINENO"
done

echo -e "  ${GREEN}Claim handlers:${RESET}"
grep -n 'ChainSwapType\.' "$FILE" | grep '"0x' | while IFS= read -r line; do
    LINENO=$(echo "$line" | cut -d: -f1)
    TYPE=$(echo "$line" | sed -n 's/.*ChainSwapType\.\([A-Z_]*\).*/\1/p')
    ADDR=$(extract_addr "$line")
    # Determine network by checking what block we're in
    BLOCK=$(head -n "$LINENO" "$FILE" | grep -c 'SN_MAIN')
    BLOCK_SEP=$(head -n "$LINENO" "$FILE" | grep 'SN_SEPOLIA\|SN_MAIN' | tail -1)
    if echo "$BLOCK_SEP" | grep -q 'SN_MAIN'; then
        NETWORK="MAINNET"
    else
        NETWORK="SEPOLIA"
    fi
    [ -n "$ADDR" ] && printf "    %-12s %-16s %s  ${DIM}(L%s)${RESET}\n" "$NETWORK" "$TYPE" "$ADDR" "$LINENO"
done

echo -e "  ${GREEN}Refund handler:${RESET}"
grep -n 'timelock.*"0x' "$FILE" | while IFS= read -r line; do
    LINENO=$(echo "$line" | cut -d: -f1)
    ADDR=$(extract_addr "$line")
    BLOCK_SEP=$(head -n "$LINENO" "$FILE" | grep 'SN_SEPOLIA\|SN_MAIN' | tail -1)
    if echo "$BLOCK_SEP" | grep -q 'SN_MAIN'; then
        NETWORK="MAINNET"
    else
        NETWORK="SEPOLIA"
    fi
    [ -n "$ADDR" ] && printf "    %-12s %-16s %s  ${DIM}(L%s)${RESET}\n" "$NETWORK" "TIMELOCK" "$ADDR" "$LINENO"
done
echo ""

# --- SPV Vault ---
REL="src/starknet/spv_swap/StarknetSpvVaultContract.ts"
FILE="$STARKNET_BASE/$REL"
echo -e "${CYAN}SPV Swap Vault${RESET}  ${DIM}$REL${RESET}"
grep -n 'spvVaultContractAddreses' "$FILE" -A5 | grep '"0x' | while IFS= read -r line; do
    LINENO=$(echo "$line" | sed -n 's/^\([0-9]*\)[:-].*/\1/p')
    ADDR=$(extract_addr "$line")
    if echo "$line" | grep -q 'SN_SEPOLIA'; then
        NETWORK="SEPOLIA"
    elif echo "$line" | grep -q 'SN_MAIN'; then
        NETWORK="MAINNET"
    else
        NETWORK="?"
    fi
    [ -n "$ADDR" ] && printf "  %-12s %s  ${DIM}(L%s)${RESET}\n" "$NETWORK" "$ADDR" "$LINENO"
done
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# EVM
# ─────────────────────────────────────────────────────────────────────────────

EVM_BASE="$PROJECT_ROOT/atomiq-chain-evm"

echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  EVM CONTRACT ADDRESSES${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo ""

for INIT_DIR in "$EVM_BASE"/src/chains/*/; do
    CHAIN_NAME=$(basename "$INIT_DIR")
    CHAIN_UPPER=$(echo "$CHAIN_NAME" | tr '[:lower:]' '[:upper:]')

    # Find the initializer .ts file
    INIT_TS=$(find "$INIT_DIR" -name "*Initializer.ts" -maxdepth 1 2>/dev/null | head -1)
    [ -z "$INIT_TS" ] && continue

    REL_PATH="${INIT_TS#$EVM_BASE/}"

    echo -e "${YELLOW}${CHAIN_UPPER}${RESET}  ${DIM}${REL_PATH}${RESET}"
    echo ""

    # Process each matching line using awk for reliable field extraction
    grep -n '"0x[0-9a-fA-F]\{10,\}"' "$INIT_TS" | while IFS= read -r grepline; do
        # Extract line number (everything before first colon)
        LNO="${grepline%%:*}"
        # Extract content (everything after first colon)
        CONTENT="${grepline#*:}"
        ADDR=$(extract_addr "$grepline")
        [ -z "$ADDR" ] && continue
        # Skip zero address (native token placeholder)
        [ "$ADDR" = "0x0000000000000000000000000000000000000000" ] && continue

        # Identify contract name from the key on that line
        if echo "$CONTENT" | grep -q 'executionContract'; then
            NAME="Execution Contract"
        elif echo "$CONTENT" | grep -q 'swapContract'; then
            NAME="Escrow Manager"
        elif echo "$CONTENT" | grep -q 'btcRelayContract'; then
            NAME="BTC Relay"
        elif echo "$CONTENT" | grep -q 'spvVaultContract'; then
            NAME="SPV Swap Vault"
        elif echo "$CONTENT" | grep -q 'timelock'; then
            NAME="Timelock Refund"
        elif echo "$CONTENT" | grep -q 'HTLC'; then
            NAME="Hashlock Claim"
        elif echo "$CONTENT" | grep -q 'CHAIN_TXID'; then
            NAME="TxID Claim"
        elif echo "$CONTENT" | grep -q 'CHAIN_NONCED'; then
            NAME="Nonced Output Claim"
        elif echo "$CONTENT" | grep -q 'CHAIN'; then
            NAME="Output Claim"
        else
            NAME="(token/other)"
        fi

        # Determine network context by scanning backwards for MAINNET/TESTNET block header
        BLOCK_CTX=$(sed -n "1,${LNO}p" "$INIT_TS" | grep -o 'MAINNET\|TESTNET4\|TESTNET' | tail -1)

        printf "  ${DIM}%-10s${RESET} %-24s %s  ${DIM}(L%s)${RESET}\n" "$BLOCK_CTX" "$NAME" "$ADDR" "$LNO"
    done
    echo ""
done
