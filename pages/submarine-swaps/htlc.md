# HTLC (hash-time locked contract)

HTLC is an agreement (smart contract) between 2 parties (A & B) consisting of hashlock & timelock. HTLC is created with 2 parameters: ***hash P*** & ***timelock T***

## Hashlock

Enables A to claim the funds from the smart contract if he is able to provide a valid ***secret S*** that hashes to pre-specified ***hash P***, such that **P = H(S)**. This is used for happy path (e.g. the lightning network payment was successful).

## Timelock

Allows B to claim the funds from the smart contract once the ***timelock T*** expires. This is used for sad path (e.g. when the counterparty doesn't cooperate) and makes sure the funds are returned to the original sender.

## Cooperative close

It is also possible to cooperatively close the contract together (but both A & B must agree on the closing terms of the contract).