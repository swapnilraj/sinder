# Sinder Architecture

## 🏗️ Unified Next.js Application

Sinder is built as a **single Next.js application** that includes both frontend and API functionality, eliminating the need for separate services or hardcoded URLs.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
│                                                             │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │    Frontend     │              │    API Routes       │   │
│  │                 │              │                     │   │
│  │  • Swipe UI     │◄────────────►│  • /api/health      │   │
│  │  • Profile      │              │  • /api/sins        │   │
│  │  • Deploy Form  │              │  • /api/user/*/     │   │
│  │  • Wallet UX    │              │    absolved         │   │
│  │                 │              │                     │   │
│  │  React + Wagmi  │              │  viem + blockchain  │   │
│  └─────────────────┘              └─────────────────────┘   │
│                                                             │
│  Benefits:                                                  │
│  ✅ No hardcoded URLs                                       │
│  ✅ Single deployment                                       │
│  ✅ Unified environment                                     │
│  ✅ Better performance                                      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     Base Sepolia        │
                    │   Smart Contracts       │
                    │                         │
                    │  • SinDeployer          │
                    │  • SinNFT instances     │
                    └─────────────────────────┘
```

## 🔧 Component Breakdown

### **Smart Contracts (Foundry)**

- **`SinDeployer`**: CREATE2 factory that deploys individual `SinNFT` contracts
  - Tracks `nextSinId`, `sinContracts[sinId]` 
  - Emits `SinDeployed`, `SinUpdated` events
  - Deterministic addresses for predictable deployment

- **`SinNFT`**: ERC-1155 soulbound tokens (one per sin)
  - Single token ID (0) per contract
  - `absolve()` function: mints SBT, forwards ETH to treasury
  - Emits `Absolved(user, priceWei)` events
  - On-chain metadata (JSON + SVG generation)

### **Frontend (React + Next.js)**

- **Swipe Interface**: Card-based UI for browsing sins
- **Profile View**: Displays user's absolved sins as badges
- **Deploy Form**: Allows users to create new sins
- **Wallet Integration**: RainbowKit + Wagmi for seamless UX

### **API Routes (Next.js Built-in)**

- **`/api/health`**: System health and contract status
- **`/api/sins`**: List all available sins with metadata
- **`/api/user/[address]/absolved`**: User's absolved sins

**Data Flow**: API routes use `viem` to read directly from blockchain, no separate indexer service needed.

## 🔄 User Flows

### **Deploy New Sin**
```
User → Deploy Form → SinDeployer.deploySin() → CREATE2 → SinNFT.initialize() → Event → API refresh
```

### **Absolve Sin**
```
User → Swipe Right → SinNFT.absolve() + ETH → Mint SBT → Absolved Event → Profile Update
```

### **View Profile**
```
User → Profile Tab → API call → Read balanceOf() for all SinNFTs → Display badges
```

## 🛡️ Security Features

- **Soulbound Tokens**: Non-transferable (transfers revert)
- **Exact Price Validation**: Must pay exact `priceWei` to absolve
- **Owner Controls**: Admin functions protected by ownership
- **Pausable**: Emergency stop functionality
- **Deterministic Addresses**: CREATE2 for predictable deployment
- **On-chain Metadata**: No external dependencies (IPFS, etc.)

## 📊 Data Management

### **Real-time Data**
- API routes read directly from blockchain using `viem`
- No caching layer needed (blockchain is source of truth)
- Events provide real-time updates for new sins and absolutions

### **State Management**
- React hooks for local state
- Wagmi for wallet and transaction state
- No global state management needed (simple architecture)

## 🚀 Deployment Architecture

### **Single Vercel Deployment**
```bash
# Deploy from root directory (vercel.json configured for frontend subdirectory)
vercel --prod
```

### **Environment Variables**
```
NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182
RPC_URL=https://sepolia.base.org
```

### **Configuration Management**
The application uses a fully configurable architecture:
- **No hardcoded contract addresses** in source code
- **Environment-driven deployment** addresses
- **Runtime validation** with production fallbacks
- **Vercel configuration** for seamless deployment

### **Benefits of Unified Architecture**
- ✅ **Simplified Deployment**: One command, one URL
- ✅ **No Configuration**: No hardcoded service URLs
- ✅ **Better Performance**: No cross-origin requests
- ✅ **Easier Development**: Single `npm run dev`
- ✅ **Cost Effective**: Single Vercel deployment
- ✅ **Maintainable**: One codebase, one set of dependencies

## 🔍 Monitoring & Observability

- **Health Endpoint**: `/api/health` for system status
- **Error Handling**: Comprehensive error boundaries
- **Transaction Tracking**: Wagmi transaction receipts
- **Vercel Analytics**: Built-in deployment monitoring

This unified architecture provides a clean, maintainable, and scalable foundation for the Sinder application.
