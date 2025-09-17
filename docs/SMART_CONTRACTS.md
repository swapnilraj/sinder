# Smart Contracts

## Production Deployment

**Contract Address**: `0xC1952E19E01F570eF2A0B3711AdDEF9E78500182` (Base Sepolia)
**Total Sins**: 31 curated production sins
**Price Range**: 0.0001 - 0.002 ETH

## SinDeployerMinimal (factory)
- CREATE2 deterministic deploys of `SinNFT` contracts
- Tracks `sinContracts[sinId]`, templates, treasury
- Emits `SinDeployed`, `SinUpdated` events
- **Key Functions**:
  - `deploySin(name, description, priceWei, active)` - Deploy new sin
  - `getSinInfo(sinId)` - Get sin details
  - `nextSinId()` - Get total sin count
  - `predictSinAddress(sinId)` - Predict contract address

## SinNFT (ERC-1155, soulbound, Initializable)
- **Token ID 0** = absolution badge (soulbound NFT)
- **Initializable** pattern for CREATE2 deployment
- **Key Functions**:
  - `initialize(treasury, sinId, name, description, priceWei)` - Setup contract
  - `absolve()` payable - Pay exact price, mint badge, forward ETH to treasury
  - `uri(0)` - Returns base64 JSON with inline SVG metadata
- **Security**: All transfers/approvals revert (soulbound)
- **Events**: `Absolved(user, priceWei)` emitted on absolution

## Sin Categories

### Classic Sins (7)
Pride, Greed, Wrath, Envy, Lust, Gluttony, Sloth

### Modern Digital Sins (7)
Doomscrolling, FOMO, Ghosting, Procrastination, Humble Bragging, Virtue Signaling, Mansplaining

### Workplace Sins (4)
Reply All Abuse, Meeting Overload, Micromanaging, Credit Stealing

### Tech Sins (4)
Not Reading Documentation, Premature Optimization, Copy-Paste Programming, Hardcoding Values

### Social Sins (4)
Double Dipping, Loud Phone Calls, Not Returning Shopping Carts, Spoiling Movies

### Crypto/Web3 Sins (5)
Aping Into Memecoins, Not Your Keys Not Your Crypto, Gas Fee Rage, Diamond Hands Delusion, Shilling Your Bags

## Deployment Scripts

- **`DeployProduction.s.sol`** - Deploy fresh production environment
- **`VerifyProduction.s.sol`** - Verify deployment and list all sins
