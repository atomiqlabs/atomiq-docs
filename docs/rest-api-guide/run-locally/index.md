---
sidebar_position: 1
---

# Run REST API Locally

Most integrators will talk to the **public Atomiq REST API**. This section is for teams that need to host the API themselves — to keep quote traffic on their own infrastructure, run against testnets, control rate limits centrally, or combine it with a custom auth layer.

The service is published as [`atomiqlabs/atomiq-api-docker`](https://github.com/atomiqlabs/atomiq-api-docker) — a thin, stateful HTTP layer over the Atomiq SDK that embeds one `SwapperApi` instance, persists swap state in SQLite, and exposes the same endpoints documented in the [REST API Reference](/rest-api-reference/atomiq-rest-api).

`atomiq-api-docker` is a single stateful container. It talks outbound to:

- **Atomiq LP nodes** — to fetch RFQ quotes and coordinate HTLC / SPV-vault setup.
- **Smart-chain RPCs** — read-only, for transaction simulation, account lookups, and broadcast.
- **Bitcoin mempool / fee APIs** — for fee estimation and PSBT building.

Clients talk to it inbound over HTTP(S). The container never holds user keys — signing happens in the **client wallet**; the API only generates unsigned transactions and submits signed ones.

![System architecture](/img/rest-api/docker-swap-backend.svg)

A typical deployment has the wallet backend running the container on an internal network and terminating TLS on it directly (or behind a reverse proxy).

## Prerequisites

- Docker 24+ with the Docker Compose plugin (`docker compose` v2).
- RPC endpoints for the smart chains you want to enable. Mainnet Bitcoin is configured by network name only (no RPC).

## 1. Build the Image

```bash
git clone https://github.com/atomiqlabs/atomiq-api-docker.git
cd atomiq-api-docker
./build.sh
```

The final image is Alpine-based, ~280 MB.

## 2. Create a `config.yaml`

Start from the bundled example (lives in `config/`):

```bash
cp config/config.yaml.example config/config.yaml
```

Minimum viable config (testnet, public access, no TLS):

```yaml
port: 3000
logLevel: info

starknetRpc: "https://rpc.starknet.lava.build/"
solanaRpc:   "https://api.devnet.solana.com"
botanixRpc: null
citreaRpc: null
alpenRpc: null
goatRpc: null
bitcoinNetwork: TESTNET

cors:
  origin: "*"

rateLimit:
  windowMs: 60000
  maxRequests: 200

auth:
  - type: none
    name: "Public"
```

See [Configuration](/rest-api-guide/run-locally/configuration) for the full schema.

### Setting up RPC endpoints

Before the service can talk to a smart chain, you need to give it an RPC URL for that chain. Three common options:

1. **Public / community RPCs** — free endpoints like `https://api.mainnet-beta.solana.com` or `https://rpc.starknet.lava.build/`. Easiest to start with, but typically rate-limited and not reliable enough for production.
2. **Hosted providers** — services like Alchemy, Infura, QuickNode, Helius (Solana), Lava, etc. give you a private URL with a generous free tier and paid plans once traffic grows.
3. **Self-hosted node** — run your own full node and point the API at it. Most control, most operational overhead.

Whichever you pick, paste the URL into the matching key in `config.yaml`. Leave a key out, or set it to `null`, to disable that chain entirely.

A few things to double-check:

- Make sure the **network of each RPC matches the rest of your config** — e.g. don't combine a mainnet Solana RPC with `bitcoinNetwork: TESTNET`. See the SDK [quick-start guide](/sdk-guide/quick-start/) for the supported network combinations.
- **Mainnet Bitcoin** is configured by network name only (`bitcoinNetwork: MAINNET`) and does not need an RPC.

## 3. Run

Use the bundled `docker-compose.yml`:

```bash
docker compose up -d
# if this doesn't work, try: docker-compose up -d
```

This starts the service on port `3000`, mounts `./config` read-only into `/src/config`, and persists the SQLite swap databases in the host `./storage` directory so they survive container restarts. The bundled compose file also sets `CONFIG_PATH=/src/config/config.yaml` and `STORAGE_DIR=/src/storage`. See [Configuration → Persistence](/rest-api-guide/run-locally/configuration#persistence) for details.

You can tail the logs with:

```bash
docker compose logs -f
```

On startup you should see:

```text
Initializing SwapperApi...
SwapperApi initialized.
Chains: STARKNET, SOLANA, ...
atomiq-api listening on port 3000
  POST /createSwap
  GET  /listSwaps
  ...
```

:::tip
If port `3000` is already in use on your host, change the host-side port in `docker-compose.yml` by editing the `ports` mapping. For example, to expose the API on port `8080`:

```yaml
services:
  atomiq-api:
    ports:
      - "8080:3000"
```
:::

## 4. Smoke Test

```bash
curl "http://localhost:3000/getSupportedTokens?side=INPUT"
```

You should see an array of token objects. If the list is non-empty, the LP network is reachable and quoting is working.


## Configuration

Full configuration details, including `config.yaml` schema, auth paths, TLS, reverse proxy, persistence, and security notes.

**[Configuration →](/rest-api-guide/run-locally/configuration)**

---