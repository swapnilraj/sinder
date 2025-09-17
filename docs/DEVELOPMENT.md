# Development Guide

## 📋 Prerequisites

- **Node.js**: 18+ (for Next.js and build tools)
- **Foundry**: Latest version (`foundryup`)
- **Base Sepolia RPC**: Access to Base Sepolia testnet
- **Vercel CLI**: For deployment (`npm i -g vercel`)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository>
cd sinder
```

### 2. Smart Contracts Development
```bash
cd contracts

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test -vv

# Deploy to Base Sepolia (Production)
forge script script/DeployProduction.s.sol:DeployProduction \
  --rpc-url "https://sepolia.base.org" \
  --broadcast -vv

# Verify deployment
forge script script/VerifyProduction.s.sol:VerifyProduction \
  --rpc-url "https://sepolia.base.org" -vv
```

### 3. Frontend Development (Unified App)
```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Create environment file with production deployer
echo "NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182" > .env.local
echo "RPC_URL=https://sepolia.base.org" >> .env.local

# Start development server
npm run dev

# Visit: http://localhost:3000
# API available at: http://localhost:3000/api/*
```

## 🏗️ Development Workflow

### **Single Application Development**
The unified architecture means you only need to run one development server:

```bash
cd frontend
npm run dev
```

This starts:
- ✅ **Frontend**: React app at `http://localhost:3000`
- ✅ **API Routes**: Available at `http://localhost:3000/api/*`
- ✅ **Hot Reload**: For both frontend and API changes

### **No Separate Services**
Unlike traditional setups, you don't need to:
- ❌ Run a separate indexer service
- ❌ Configure cross-origin requests
- ❌ Manage multiple ports
- ❌ Set up service discovery

## 🔧 Environment Configuration

### **Smart Contracts (contracts/.env)**
```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=your_treasury_address_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### **Frontend (frontend/.env.local)**
```bash
# Production contract address (deployed via DeployProduction.s.sol)
NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182

# RPC endpoint for API routes
RPC_URL=https://sepolia.base.org
```

## 🧪 Testing

### **Smart Contract Tests**
```bash
cd contracts
forge test -vv

# Run specific test
forge test --match-test testAbsolveSin -vv

# Gas report
forge test --gas-report
```

### **Frontend Testing**
```bash
cd frontend

# Type checking
npm run type-check

# Build verification
npm run build

# Linting
npm run lint
```

## 🔍 API Development

### **Built-in API Routes**
The app includes these API endpoints:

- **`GET /api/health`**: System status and contract info
- **`GET /api/sins`**: List all available sins
- **`GET /api/user/[address]/absolved`**: User's absolved sins

### **Adding New Endpoints**
Create new files in `frontend/src/app/api/`:

```typescript
// frontend/src/app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello API' });
}
```

### **Blockchain Integration**
API routes use `viem` to read from Base Sepolia:

```typescript
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL)
});
```

## 🚀 Deployment

### **Production Build**
```bash
cd frontend
npm run build

# Verify build success
npm run start
```

### **Deploy to Vercel**
```bash
cd frontend
vercel --prod

# Environment variables configured in vercel.json:
# NEXT_PUBLIC_DEPLOYER_ADDRESS=0xC1952E19E01F570eF2A0B3711AdDEF9E78500182
# RPC_URL=https://sepolia.base.org
```

## 🛠️ Troubleshooting

### **Common Issues**

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**RPC Connection Issues:**
```bash
# Test RPC endpoint
curl -X POST https://sepolia.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

**Contract Deployment:**
```bash
# Verify contract on explorer
forge verify-contract <address> <contract> --chain base-sepolia
```

### **Development Tips**

1. **Hot Reload**: Both frontend and API routes support hot reload
2. **Error Handling**: Check browser console and terminal for errors
3. **Network Switching**: Ensure wallet is on Base Sepolia
4. **Transaction Testing**: Use small amounts for testing

## 📁 Project Structure

```
/
├─ contracts/           # Smart contracts (Foundry)
│  ├─ src/             # Solidity source files
│  ├─ test/            # Contract tests
│  └─ script/          # Deployment scripts
├─ frontend/           # Unified Next.js application
│  ├─ src/app/         # React pages and components
│  ├─ src/app/api/     # API routes (built-in indexer)
│  ├─ src/lib/         # Utilities and contract ABIs
│  └─ public/          # Static assets
└─ docs/               # Documentation
```

## 🎯 Development Best Practices

- **Single Responsibility**: Keep API routes focused and simple
- **Error Handling**: Always handle blockchain connection errors
- **Type Safety**: Use TypeScript throughout the application
- **Environment Variables**: Never commit sensitive keys
- **Testing**: Test contracts thoroughly before deployment
- **Documentation**: Update docs when adding features

This unified development approach simplifies the entire workflow while maintaining professional standards.
