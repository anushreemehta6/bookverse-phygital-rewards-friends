# BookVerse Flow Blockchain Deployment Guide

This guide walks through deploying the BookVerse NFT contracts to the Flow blockchain and setting up the complete Web3 integration.

## Prerequisites

1. **Node.js and npm** installed
2. **Flow CLI** installed (`sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"`)
3. **Flow wallet** (Flow Reference Wallet or similar)
4. **Testnet FLOW tokens** for deployment

## Step 1: Environment Setup

1. Copy the Flow environment template:
```bash
cp .env.flow .env.local
```

2. Update `.env.local` with your values:
```env
VITE_FLOW_NETWORK=testnet
VITE_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
VITE_FLOW_DISCOVERY=https://fcl-discovery.onflow.org/testnet/authn
```

## Step 2: Account Setup

1. Create a Flow testnet account:
   - Visit https://testnet-faucet.onflow.org/
   - Connect your wallet and fund with testnet FLOW

2. Configure your deployment account:
```bash
flow accounts create --network testnet
```

3. Update your private key in `.env.local`:
```env
FLOW_ADMIN_PRIVATE_KEY=your_private_key_here
FLOW_ADMIN_ADDRESS=your_address_here
```

## Step 3: Contract Deployment

### Option 1: Using the Deployment Script

```bash
npm run deploy:flow
```

This script will:
- Deploy the BookVerseNFT contract to testnet
- Set up the initial achievement types
- Configure the minter resource

### Option 2: Manual Deployment

1. Deploy contracts using Flow CLI:
```bash
flow project deploy --network testnet
```

2. Or use the JavaScript deployment script:
```bash
node flow/deploy.js --deploy
```

## Step 4: Verify Deployment

1. Check your contract on Flow testnet:
   - Visit https://testnet.flowscan.org/
   - Search for your contract address

2. Test basic contract functions:
```bash
# Get achievement types
flow scripts execute flow/scripts/get-achievement-types.cdc --network testnet

# Check contract deployment
flow accounts get YOUR_ADDRESS --network testnet
```

## Step 5: Frontend Configuration

1. Update contract addresses in `.env.local`:
```env
VITE_BOOKVERSE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

2. Start the development server:
```bash
npm run dev
```

3. Test wallet connection and NFT functionality in the app

## Step 6: Set Up Collection (First-time Users)

Each user needs to set up their NFT collection before receiving NFTs:

1. Connect wallet in the BookVerse app
2. Click "Setup NFT Collection" when prompted
3. Approve the transaction in your wallet

## Step 7: Testing NFT Minting

**Note:** NFT minting requires admin privileges. In production, this would be handled by a backend service.

1. For testing, you can mint NFTs using the script:
```bash
# Example: Mint a reading streak master NFT
flow transactions send flow/transactions/mint-achievement-nft.cdc \
  --args String:0xRECIPIENT_ADDRESS \
  --args String:reading_streak_master \
  --args '{String:String}:{"test":"true"}' \
  --network testnet \
  --signer YOUR_ADMIN_ACCOUNT
```

## Step 8: Production Considerations

### Security
- Never commit private keys to version control
- Use environment variables for sensitive data
- Implement proper access controls for minting

### Backend Integration
- Set up a backend service for automated NFT minting
- Implement achievement verification logic
- Create APIs for phygital redemption tracking

### Partner Integration
- Coordinate with partner stores for redemption codes
- Set up QR code scanning systems
- Implement inventory management for rewards

## Troubleshooting

### Common Issues

1. **Transaction Failed**: Check you have sufficient FLOW tokens
2. **Contract Not Found**: Verify the contract address in your environment
3. **Collection Not Setup**: Users must set up their collection first
4. **Wallet Connection Issues**: Clear browser cache and reconnect

### Useful Commands

```bash
# Check account balance
flow accounts get ADDRESS --network testnet

# View transaction details
flow transactions get TRANSACTION_ID --network testnet

# Check logs
flow events get --network testnet --type A.CONTRACT.BookVerseNFT.Minted
```

## Flow Testnet Resources

- **Faucet**: https://testnet-faucet.onflow.org/
- **Explorer**: https://testnet.flowscan.org/
- **Documentation**: https://developers.flow.com/
- **CLI Reference**: https://developers.flow.com/tools/flow-cli

## Next Steps

1. **Mainnet Deployment**: Follow similar steps for mainnet deployment
2. **Partner Onboarding**: Integrate with actual bookstore partners
3. **Mobile App**: Consider building mobile apps with Flow SDK
4. **Advanced Features**: Add more achievement types and redemption options

## Support

For deployment issues:
- Check Flow Discord: https://discord.gg/flow
- Review Flow documentation: https://developers.flow.com/
- BookVerse specific issues: Create an issue in the repository