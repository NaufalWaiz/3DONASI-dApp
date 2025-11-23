# DonasiChain

Implementasi MVP untuk aplikasi donasi berbasis Web3 sesuai `TechSpec.md`. Repo ini memisahkan smart contract dan front-end.

## Struktur

- `contract/` – workspace Hardhat + smart contract `DonasiChain.sol`, lengkap dengan unit test dan skrip deploy.
- `frontend/` – aplikasi Next.js + Tailwind + Wagmi + Viem untuk kampanye donasi.

## Menjalankan Smart Contract

```bash
cd contract
cp .env.example .env          # isi RPC + private key testnet
npm install
npm test                      # menjalankan unit test
npx hardhat node              # optional: local chain
npx hardhat run scripts/deploy.js --network sepolia
```

## Menjalankan Front-End

```bash
cd frontend
cp .env.example .env.local    # isi alamat kontrak & RPC publik
npm install
npm run dev
```

Front-end menggunakan Wagmi Provider (Sepolia) dan otomatis membaca riwayat donasi, saldo kontrak, form donasi (ETH), panel admin (withdraw untuk owner), serta notifikasi status transaksi.
