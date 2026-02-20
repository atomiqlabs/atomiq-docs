cd repos
cd atomiq-base
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-sdk
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-chain-starknet
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-chain-solana
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-chain-evm
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-storage-sqlite
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-storage-rn-async
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-storage-memory-indexed-kv
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-btc-mempool
git stash
git pull -f --rebase
npm i
cd ..
cd atomiq-messenger-nostr
git stash
git pull -f --rebase
npm i
cd ..
cd ..
