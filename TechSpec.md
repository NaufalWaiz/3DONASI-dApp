# Web3 Donation dApp — Tech Specification Document

## 1. Ringkasan Proyek

**Nama Proyek:** 3DONASI 
**Jenis Aplikasi:** Web3 Donation dApp  
**Deskripsi:**
DonasiChain adalah aplikasi donasi berbasis blockchain yang memungkinkan pengguna melakukan donasi menggunakan cryptocurrency (ETH). Semua data donasi disimpan di smart contract secara transparan. Owner dapat menarik dana (withdraw) kapan saja melalui fungsi khusus.

---

## 2. Tujuan & Use Case

### 2.1 Tujuan Utama
- Membangun platform donasi yang transparan dan anti-manipulasi.
- Mengimplementasikan smart contract sederhana untuk menerima donasi.
- Mengintegrasikan wallet Web3 (MetaMask) untuk melakukan pembayaran.
- Menjadi project portfolio Web3 pertama yang kuat dan profesional.

### 2.2 Use Case
**Donatur:**
- Connect wallet (MetaMask).
- Membuat donasi dalam bentuk ETH.
- Melihat list donatur & jumlah donasi.
- Melihat total donasi terkumpul.

**Admin/Owner:**
- Menarik seluruh dana dari smart contract (withdraw).
- Melihat seluruh riwayat donasi.

---

## 3. Peran Pengguna

### 3.1 Visitor
- Melihat total donasi.
- Melihat deskripsi campaign.
- Melihat daftar donatur.
- Diminta connect wallet untuk melakukan donasi.

### 3.2 Donatur (Wallet Terhubung)
- Semua fitur Visitor.
- Dapat melakukan donasi.
- Dapat melihat total donasi pribadi (optional).

### 3.3 Owner
- Semua fitur Donatur.
- Dapat menarik dana (withdraw).

---

## 4. Fitur Utama (MVP)

### 4.1 Front-End
- Halaman campaign:
  - Deskripsi campaign.
  - Total donasi.
  - Jumlah transaksi.
  - Form donasi.
  - Connect Wallet button.
- Riwayat donasi:
  - Alamat donatur.
  - Jumlah donasi.
  - Timestamp.
- Panel Admin:
  - Total saldo kontrak.
  - Tombol Withdraw (hanya muncul untuk owner).
- Status & Notifikasi:
  - Transaksi loading.
  - Transaksi sukses/gagal.

### 4.2 Smart Contract
- Menerima donasi melalui `donate()`.
- Menyimpan:
  - Total donasi.
  - Donasi per alamat.
  - Riwayat donasi (array).
- Event:
  - `DonationReceived`.
  - `FundsWithdrawn`.
- Fungsi owner:
  - `withdraw()`.
- Fungsi view:
  - `getTotalDonations()`
  - `getDonorTotal(address)`
  - `getDonationsCount()`
  - `getDonation(index)`

---

## 5. Ruang Lingkup (MVP)

**Termasuk:**
- 1 smart contract untuk 1 campaign.
- UI/UX dasar.
- Donasi ETH langsung ke smart contract.
- Withdraw oleh owner.

**Tidak Termasuk:**
- Multi-campaign.
- Off-chain server.
- ERC20 token support.
- ENS integration.

---

## 6. Arsitektur Sistem

### 6.1 Komponen
- **Front-End:** Next.js + React
- **Smart Contract:** Solidity 0.8.x
- **Tools:** Hardhat
- **Network:** Ethereum Testnet (Sepolia)
- **Wallet:** MetaMask
- **Web3 Libraries:** Wagmi + Viem (recommended) atau Ethers.js

### 6.2 Alur Sistem
1. User membuka website.
2. Front-end membaca data dari smart contract:
   - Total donasi.
   - Riwayat donasi.
3. User connect wallet.
4. User melakukan donasi:
   - Memanggil `donate()` dengan `msg.value`.
5. Smart contract menyimpan data donasi.
6. Owner dapat menarik dana melalui `withdraw()`.
7. UI otomatis update setelah transaksi.

---

## 7. Desain Smart Contract

### 7.1 Struktur Data

```solidity
address public owner;
uint256 public totalDonations;

struct Donation {
    address donor;
    uint256 amount;
    uint256 timestamp;
}

Donation[] public donations;
mapping(address => uint256) public donorTotal;
```

### 7.2 Event

```solidity
event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);
```

### 7.3 Modifier

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

### 7.4 Fungsi Utama

#### Constructor
```solidity
constructor() {
    owner = msg.sender;
}
```

#### donate()
```solidity
function donate() external payable {
    require(msg.value > 0, "Amount must be > 0");

    totalDonations += msg.value;
    donorTotal[msg.sender] += msg.value;

    donations.push(Donation(msg.sender, msg.value, block.timestamp));

    emit DonationReceived(msg.sender, msg.value, block.timestamp);
}
```

#### withdraw()
```solidity
function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No funds");

    (bool success, ) = owner.call{value: balance}("");
    require(success, "Withdraw failed");

    emit FundsWithdrawn(owner, balance, block.timestamp);
}
```

#### View functions
```solidity
function getDonationsCount() public view returns (uint256) {
    return donations.length;
}

function getDonation(uint256 index) public view returns (address, uint256, uint256) {
    Donation memory d = donations[index];
    return (d.donor, d.amount, d.timestamp);
}
```

---

## 8. Flow UX / UI

### 8.1 Alur Donatur
1. Masuk ke website.
2. Klik **Connect Wallet**.
3. Masukkan nominal donasi.
4. Klik **Donate**.
5. Konfirmasi transaksi di MetaMask.
6. Notifikasi sukses.
7. List donasi ter-update otomatis.

### 8.2 Alur Admin (Withdraw)
1. Connect wallet sebagai owner.
2. Panel admin muncul.
3. Klik **Withdraw All**.
4. Konfirmasi transaksi.
5. Saldo kontrak menjadi 0.

---

## 9. Tech Stack Detail

### Front-End
- Next.js
- React
- Tailwind CSS
- Wagmi + Viem / Ethers.js

### Smart Contract
- Solidity 0.8.x
- Hardhat
- Node.js
- Chai / Mocha (testing)

### Deployment
- Smart Contract → Sepolia Testnet
- Front-End → Vercel / Netlify

---

## 10. Keamanan

- Gunakan `onlyOwner` untuk withdraw.
- Gunakan pola withdraw aman (call pattern).
- Cegah re-entrancy.
- Test contract di testnet sebelum mainnet.
- Jangan simpan data sensitif di blockchain.

---

## 11. Future Improvement

- Multi-campaign system.
- Support stablecoin (USDT, USDC).
- Off-chain caching server.
- Ranking top donors.
- Dashboard analytics.
- UI/UX yang lebih profesional.

---

## 12. Status Project (MVP)
- [ ] Smart contract selesai
- [ ] Hardhat setup
- [ ] Next.js setup
- [ ] Connect wallet
- [ ] Donate function UI
- [ ] Withdraw function UI
- [ ] Riwayat donasi UI
- [ ] Deployment dApp
