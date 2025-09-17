# API Reference

Sinder uses **Next.js API Routes** built into the frontend application. All endpoints are available at the same domain as the frontend, eliminating the need for separate services or CORS configuration.

## 🚀 Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://your-app.vercel.app/api`

## 📡 REST Endpoints

### **GET /api/health**

System health check and contract information.

**Response:**
```json
{
  "status": "healthy",
  "sinsLoaded": 31,
  "deployerAddress": "0xC1952E19E01F570eF2A0B3711AdDEF9E78500182",
  "lastKnownSinId": 31,
  "timestamp": 1703123456789
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": "RPC connection failed"
}
```

---

### **GET /api/sins**

Retrieve all available sins with metadata.

**Query Parameters:**
- `limit` (optional): Maximum number of sins to return (default: 100)
- `offset` (optional): Number of sins to skip (default: 0)
- `active` (optional): Filter by active status ("true" | "false", default: "true")

**Example Request:**
```
GET /api/sins?limit=10&offset=0&active=true
```

**Response:**
```json
{
  "sins": [
    {
      "id": 0,
      "contract": "0x0b90448d308665AcCF220B7AbE7f65f97af209Dd",
      "name": "Pride",
      "description": "Excessive self-regard and arrogance",
      "priceWei": "1000000000000000",
      "priceEth": "0.001",
      "active": true,
      "createdAt": 1703123456789
    },
    {
      "id": 10,
      "contract": "0xB340534C7a1EE2960d167265a2E977FEDfDa052E",
      "name": "Procrastination",
      "description": "Delaying important tasks until the last minute",
      "priceWei": "200000000000000",
      "priceEth": "0.0002",
      "active": true,
      "createdAt": 1703123456789
    }
  ],
  "total": 31,
  "hasMore": true
}
```

**Error Response:**
```json
{
  "error": "Internal server error",
  "message": "Failed to read from blockchain"
}
```

---

### **GET /api/user/[address]/absolved**

Get a user's absolved sins (soulbound badges).

**Path Parameters:**
- `address`: User's Ethereum address (0x...)

**Example Request:**
```
GET /api/user/0x1234567890abcdef1234567890abcdef12345678/absolved
```

**Response:**
```json
{
  "absolvedSins": [
    {
      "sinId": 0,
      "sinName": "Pride",
      "sinDescription": "Excessive self-regard",
      "priceWei": "1000000000000000",
      "priceEth": "0.001",
      "timestamp": 1703123456789
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "User address is required"
}
```

## 🔗 Smart Contract Integration

The API routes use `viem` to interact directly with Base Sepolia contracts:

### **SinDeployerMinimal Contract**
```typescript
// Read functions
function nextSinId() view returns (uint256)
function sinContracts(uint256) view returns (address)
function getSinInfo(uint256) view returns (address, string, string, uint256, bool)

// Write functions  
function deploySin(string name, string description, uint256 priceWei, bool active) returns (uint256, address)

// Events
event SinDeployed(uint256 indexed sinId, address indexed sinContract, string name, uint256 priceWei)
event SinUpdated(uint256 indexed sinId, string name, uint256 priceWei, bool active)

// Production Contract: 0xC1952E19E01F570eF2A0B3711AdDEF9E78500182 (Base Sepolia)
```

### **SinNFT Contract (ERC-1155)**
```typescript
// Read functions
function balanceOf(address account, uint256 id) view returns (uint256)
function uri(uint256 id) view returns (string)

// Write functions
function absolve() payable  // Mints soulbound NFT

// Events  
event Absolved(address indexed user, uint256 priceWei)
```

## 🛠️ Implementation Details

### **Blockchain Client Setup**
```typescript
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL || 'https://sepolia.base.org')
});

// Deployer address is configurable via environment
const DEPLOYER_ADDRESS = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || '0xC1952E19E01F570eF2A0B3711AdDEF9E78500182';
```

### **Error Handling**
All API routes implement consistent error handling:

```typescript
try {
  // Blockchain operation
  const result = await client.readContract({...});
  return NextResponse.json({ data: result });
} catch (error: unknown) {
  console.error('API Error:', error);
  return NextResponse.json({ 
    error: 'Internal server error',
    message: error instanceof Error ? error.message : 'Unknown error' 
  }, { status: 500 });
}
```

### **Type Safety**
All responses use TypeScript interfaces:

```typescript
interface Sin {
  id: number;
  contract: string;
  name: string;
  description: string;
  priceWei: string;
  priceEth: string;
  active: boolean;
  createdAt: number;
}

interface Absolution {
  sinId: number;
  sinName: string;
  sinDescription: string;
  priceWei: string;
  priceEth: string;
  timestamp: number;
}
```

## 🔄 Real-time Updates

The API provides real-time blockchain data by:
1. **Direct Reads**: Each request fetches fresh data from Base Sepolia
2. **No Caching**: Ensures users see the latest state
3. **Event-based**: Frontend can poll for updates or use WebSocket (future enhancement)

## 🚀 Usage Examples

### **Frontend Integration**
```typescript
// Fetch all sins
const response = await fetch('/api/sins?limit=50');
const { sins } = await response.json();

// Check user's absolved sins
const userResponse = await fetch(`/api/user/${address}/absolved`);
const { absolvedSins } = await userResponse.json();

// Health check
const healthResponse = await fetch('/api/health');
const status = await healthResponse.json();
```

### **Error Handling**
```typescript
try {
  const response = await fetch('/api/sins');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Failed to fetch sins:', error);
  // Handle error
}
```

## 🎯 Benefits of Unified API

- ✅ **No CORS Issues**: Same-origin requests
- ✅ **Simplified Development**: One server, one port
- ✅ **Better Performance**: No network overhead between services
- ✅ **Type Safety**: Shared TypeScript interfaces
- ✅ **Easier Deployment**: Single Vercel deployment
- ✅ **Unified Logging**: All requests in one place

This API design provides a clean, efficient interface for the Sinder application while maintaining simplicity and performance.
