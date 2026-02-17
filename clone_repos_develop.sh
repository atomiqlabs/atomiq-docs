rm -f -r repos
mkdir repos
cd repos
git clone -b develop --single-branch https://github.com/atomiqlabs/atomiq-sdk
cd atomiq-sdk
npm i
cd ..
git clone -b develop --single-branch https://github.com/atomiqlabs/atomiq-chain-starknet
cd atomiq-chain-starknet
npm i
cd ..
git clone -b develop --single-branch https://github.com/atomiqlabs/atomiq-chain-solana
cd atomiq-chain-solana
npm i
cd ..
git clone -b develop --single-branch https://github.com/atomiqlabs/atomiq-chain-evm
cd atomiq-chain-evm
npm i
cd ..
git clone -b develop --single-branch https://github.com/atomiqlabs/atomiq-storage-sqlite
cd atomiq-storage-sqlite
npm i
cd ..
git clone https://github.com/atomiqlabs/atomiq-storage-rn-async
cd atomiq-storage-rn-async
npm i
cd ..
git clone https://github.com/atomiqlabs/atomiq-storage-memory-indexed-kv
cd atomiq-storage-memory-indexed-kv
npm i
cd ..
cd ..
