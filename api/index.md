---
slug: /api
title: API Reference
sidebar_position: 0
---

# API Reference

Auto-generated TypeScript API documentation for the Atomiq SDK.

## Packages

### [SDK](/api/sdk)

Public-facing SDK for integrating Atomiq swaps into your application.

- **SwapperFactory** - Factory for creating Swapper instances
- **Utils** - Utility functions for amount conversion
- **Storage** - Browser and filesystem storage implementations

### [SDK Library](/api/sdk-lib)

Core library with swap logic, Bitcoin/Lightning integration, and pricing.

- **Swapper** - Main class for creating and managing swaps
- **Swap Types** - IToBTCSwap, IFromBTCSwap, and implementations
- **Bitcoin/Lightning** - MempoolBitcoinRpc, LightningNetworkApi
- **Pricing** - Price providers and aggregation
- **Intermediaries** - LP discovery and API communication
