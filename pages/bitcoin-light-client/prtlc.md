# PrTLC (proof-time locked contract)

Contract construction is similar to hash-time locked contract (HTLC), where claimer needs to provide a proof instead of a secret for a hash. In this case the proof is transaction verification through bitcoin light client by providing a valid merkle proof for a transaction inclusion inside a bitcoin blockheader.

PrTLC is an agreement (smart contract) between 2 parties (A & B) consisting of proof-lock & timelock. It is created with 2 parameters: ***bitcoin transaction TX*** (as identified by the tx id, or a specific transaction input/output) & ***timelock T***

### Proof-lock

Enables A to claim the funds from the smart contract if he is able to prove that a **bitcoin transaction TX** was confirmed in a bitcoin block (using bitcoin light client & merkle proof of transaction inclusion). This is used for happy path (the bitcoin payment was successful).

### Timelock

Allows B to claim the funds from the smart contract once the ***timelock T*** expires. This is used for sad path (e.g. when the counterparty doesn't cooperate) and makes sure the funds are returned to the original sender.

### Cooperative close

It is also possible to cooperatively close the contract together (but both A & B must agree on the closing terms of the contract).