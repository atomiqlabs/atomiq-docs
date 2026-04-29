---
sidebar_position: 1
---

# Run REST API Locally

Most integrators will talk to the **public Atomiq REST API**. This section is for teams that need to host the API themselves — to keep quote traffic on their own infrastructure, run against testnets, control rate limits centrally, or combine it with a custom auth layer.

The service is published as [`atomiqlabs/atomiq-api-docker`](https://github.com/atomiqlabs/atomiq-api-docker) — a thin, stateful HTTP layer over the Atomiq SDK that embeds one `SwapperApi` instance, persists swap state in SQLite, and exposes the same endpoints documented in the [REST API Reference](/rest-api-reference/overview).

## Deployment shape

`atomiq-api-docker` is a single stateful container. It talks outbound to:

- **Atomiq LP nodes** — to fetch RFQ quotes and coordinate HTLC / SPV-vault setup.
- **Smart-chain RPCs** — read-only, for transaction simulation, account lookups, and broadcast.
- **Bitcoin mempool / fee APIs** — for fee estimation and PSBT building.

Clients talk to it inbound over HTTP(S). The container never holds user keys — signing happens in the **client wallet**; the API only generates unsigned transactions and submits signed ones.

![System architecture](/img/rest-api/docker-swap-backend.svg)

A typical deployment has the wallet backend running the container on an internal network and terminating TLS on it directly (or behind a reverse proxy).

## What This Service Is Not

- **Not a custodian.** All signing happens in the client wallet; the API holds no private keys.
- **Not a liquidity provider.** Quotes come from the Atomiq LP network.
- **Not a UI.** It is a backend service — you build the wallet UX around it.

## Next steps

- **[Quick Start →](/rest-api-guide/run-locally/quick-start)** — run the container with Docker Compose and hit the smoke-test endpoint.
- **[Configuration →](/rest-api-guide/run-locally/configuration)** — full `config.yaml` schema, auth paths, TLS, reverse proxy, persistence, and security notes.
