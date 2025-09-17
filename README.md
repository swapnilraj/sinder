# Sinder — Confess, Indulge, Absolve

Swipe-to-absolve on Base Sepolia. Swipe right on a sin → pay ETH → mint a soulbound badge. Profiles show redeemed sins.

- **Chain**: Base Sepolia (Testnet)
- **Architecture**: Unified Next.js app with built-in API routes
- **Wallet**: RainbowKit + Wagmi
- **Contracts**: CREATE2 factory + Initializable ERC-1155 (soulbound)
- **Deployment**: Single Vercel deployment

## 🚀 Live Demo

- **App**: [Deploy to Vercel - Single unified deployment]
- **Production Contract**: `0xC1952E19E01F570eF2A0B3711AdDEF9E78500182` on Base Sepolia
- **Total Sins**: 31 curated production sins across multiple categories

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Single Next.js App              │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Frontend   │  │   API Routes    │   │
│  │   React     │◄─┤  /api/health    │   │
│  │   Swipe UI  │  │  /api/sins      │   │
│  │   Profile   │  │  /api/user/*/   │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  No separate services! ✅              │
│  No hardcoded URLs! ✅                 │
└─────────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │ Base Sepolia    │
          │ Smart Contracts │
          └─────────────────┘
```

## 📁 Project Structure

```
/
├─ docs/                 # Documentation
├─ contracts/            # Smart contracts (Foundry)
├─ frontend/            # Unified Next.js app
│  ├─ src/app/          # React components & pages
│  ├─ src/app/api/      # Built-in API routes
│  ├─ src/lib/          # Utilities & contracts
│  └─ package.json      # Dependencies
└─ scripts/             # Deployment scripts
```

## 🚀 Quick Start

### Local Development

```bash
# Clone and setup
git clone <repo>
cd sin-token/frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182" > .env.local
echo "RPC_URL=https://sepolia.base.org" >> .env.local

# Start unified app
npm run dev

# Visit: http://localhost:3000
# API available at: http://localhost:3000/api/*
```

### Production Deployment

```bash
# Single command deployment
cd frontend
vercel --prod

# Environment variables (configured in vercel.json):
# NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182
# RPC_URL=https://sepolia.base.org
```

## 🎮 How to Play

1. **Connect Wallet** - Use RainbowKit to connect your wallet
2. **Switch to Base Sepolia** - Make sure you're on the right network  
3. **Swipe Right** - Browse sins and swipe right to absolve them
4. **Pay ETH** - Confirm the transaction to pay for absolution
5. **View Profile** - See your absolved sins as soulbound badges
6. **Deploy New Sins** - Add your own sins for others to absolve

## 😈 Production Sins

### Classic Seven Deadly Sins
- **Pride** (0.001 ETH) - Excessive self-regard and arrogance
- **Greed** (0.002 ETH) - Insatiable desire for wealth and material gain
- **Wrath** (0.0015 ETH) - Uncontrolled anger and hatred
- **Envy** (0.0012 ETH) - Resentment of others' success and possessions
- **Lust** (0.0018 ETH) - Excessive desire for physical pleasure
- **Gluttony** (0.0008 ETH) - Overindulgence in food, drink, or consumption
- **Sloth** (0.0005 ETH) - Laziness and avoidance of work or effort

### Modern Digital Sins
- **Doomscrolling** (0.0003 ETH) - Endless consumption of negative news
- **FOMO** (0.0007 ETH) - Fear of missing out on trends and experiences
- **Ghosting** (0.0004 ETH) - Suddenly cutting off all communication
- **Procrastination** (0.0002 ETH) - Delaying important tasks until the last minute

### Tech Sins
- **Not Reading Documentation** (0.0001 ETH) - Asking questions answered in the docs
- **Premature Optimization** (0.0004 ETH) - Optimizing code before it's needed
- **Copy-Paste Programming** (0.0003 ETH) - Coding without understanding
- **Hardcoding Values** (0.0002 ETH) - Embedding configuration in source code

### Crypto/Web3 Sins
- **Aping Into Memecoins** (0.001 ETH) - Investing life savings in dog-themed tokens
- **Gas Fee Rage** (0.0003 ETH) - Paying $50 to transfer $10 worth of tokens
- **Diamond Hands Delusion** (0.0006 ETH) - Holding worthless tokens out of stubbornness
- **Shilling Your Bags** (0.0004 ETH) - Promoting tokens you're trying to exit

*...and 11 more sins across workplace, social, and other categories!*

## 📚 Documentation

- **Architecture**: `docs/ARCHITECTURE.md` - System design
- **Smart Contracts**: `docs/SMART_CONTRACTS.md` - Contract details
- **Development**: `docs/DEVELOPMENT.md` - Setup guide
- **API Reference**: `docs/API.md` - API endpoints
- **Contributing**: `docs/CONTRIBUTING.md` - Contribution guide

## 🏗️ Technical Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **API**: Next.js API Routes (built-in)
- **Smart Contracts**: Solidity + Foundry
- **Wallet**: RainbowKit + Wagmi + viem
- **Blockchain**: Base Sepolia Testnet
- **Deployment**: Vercel (single unified deployment)

## ✨ Key Features

- **Unified Architecture** - Frontend + API in one deployment
- **Real-time Indexing** - Built-in blockchain data fetching
- **Soulbound NFTs** - Non-transferable absolution badges
- **Swipe Interface** - Intuitive mobile-first design
- **Community Driven** - Users can deploy new sins
- **Gas Optimized** - Low-cost transactions on Base Sepolia

---

**License**: MIT (see LICENSE)
