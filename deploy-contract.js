/**
 * BookVerse Contract Deployment Script (Server-side)
 * 
 * This script deploys the BookVerse NFT contract using Flow CLI commands
 * Run with: node deploy-contract.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const ADMIN_ADDRESS = process.env.FLOW_ADMIN_ADDRESS;
const ADMIN_PRIVATE_KEY = process.env.FLOW_ADMIN_PRIVATE_KEY;

if (!ADMIN_PRIVATE_KEY || !ADMIN_ADDRESS) {
  console.error("❌ Missing FLOW_ADMIN_PRIVATE_KEY or FLOW_ADMIN_ADDRESS in .env.local");
  process.exit(1);
}

async function deployContractWithCLI() {
  try {
    console.log("🚀 Starting BookVerse NFT contract deployment...");
    console.log(`📍 Deploying to account: ${ADMIN_ADDRESS}`);

    // Read and process contract code
    const contractPath = path.join(process.cwd(), "flow/contracts/BookVerseNFT.cdc");
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract file not found: ${contractPath}`);
    }

    let contractCode = fs.readFileSync(contractPath, "utf8");
    console.log("📝 Contract code loaded");

    // Replace import paths with testnet addresses
    contractCode = contractCode
      .replace(/from \"\.\/standards\/NonFungibleToken\.cdc\"/, "from 0x631e88ae7f1d7c20")
      .replace(/from \"\.\/standards\/ViewResolver\.cdc\"/, "from 0x631e88ae7f1d7c20")  
      .replace(/from \"\.\/standards\/MetadataViews\.cdc\"/, "from 0x631e88ae7f1d7c20");

    // Write processed contract to temp file
    const tempContractPath = path.join(process.cwd(), "temp_contract.cdc");
    fs.writeFileSync(tempContractPath, contractCode);

    console.log("📝 Contract code processed for testnet deployment");

    // Create flow.json if it doesn't exist or update it
    const flowConfig = {
      accounts: {
        "testnet-account": {
          address: ADMIN_ADDRESS,
          key: ADMIN_PRIVATE_KEY
        }
      },
      contracts: {
        "BookVerseNFT": {
          source: "./temp_contract.cdc",
          aliases: {
            testnet: ADMIN_ADDRESS
          }
        }
      },
      networks: {
        testnet: "access.devnet.nodes.onflow.org:9000"
      },
      deployments: {
        testnet: {
          "testnet-account": [
            "BookVerseNFT"
          ]
        }
      }
    };

    fs.writeFileSync('flow.json', JSON.stringify(flowConfig, null, 2));
    console.log("📄 Flow configuration updated");

    // Deploy using Flow CLI
    console.log("⏳ Deploying contract to Flow testnet...");
    
    try {
      const result = execSync('flow project deploy --network testnet', { 
        stdio: 'pipe',
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log("✅ Contract deployment successful!");
      console.log("📋 Deployment result:", result);
      
      // Update environment file with contract address
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace the placeholder address with actual deployed address
      envContent = envContent.replace(
        'VITE_BOOKVERSE_CONTRACT_ADDRESS=0x0000000000000000',
        `VITE_BOOKVERSE_CONTRACT_ADDRESS=${ADMIN_ADDRESS}`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log("🔧 Environment file updated with contract address");
      
      // Clean up temp file
      fs.unlinkSync(tempContractPath);
      
      console.log("🎉 BookVerse NFT contract deployed successfully!");
      console.log(`📍 Contract Address: ${ADMIN_ADDRESS}`);
      console.log("🔗 View on Flow Testnet: https://testnet.flowscan.org/account/" + ADMIN_ADDRESS);
      
      return { success: true, address: ADMIN_ADDRESS };
      
    } catch (deployError) {
      console.log("⚠️ Flow CLI deployment failed, trying alternative method...");
      console.log("Error:", deployError.message);
      
      // Alternative: Manual transaction approach
      console.log("📝 Creating deployment transaction...");
      
      const deployTransaction = `
        transaction(contractCode: String) {
          prepare(signer: AuthAccount) {
            signer.contracts.add(name: "BookVerseNFT", code: contractCode.utf8)
          }
        }
      `;
      
      // Write transaction to file
      fs.writeFileSync('deploy-transaction.cdc', deployTransaction);
      
      // Try to deploy using transaction
      const txResult = execSync(`flow transactions send deploy-transaction.cdc --arg String:"${contractCode.replace(/"/g, '\\"')}" --network testnet --signer testnet-account`, { 
        stdio: 'pipe',
        encoding: 'utf8' 
      });
      
      console.log("✅ Contract deployed via transaction!");
      console.log("📋 Transaction result:", txResult);
      
      // Clean up
      fs.unlinkSync('deploy-transaction.cdc');
      fs.unlinkSync(tempContractPath);
      
      return { success: true, address: ADMIN_ADDRESS };
    }

  } catch (error) {
    console.error("💥 Deployment failed:", error.message);
    
    // Clean up on error
    const tempContractPath = path.join(process.cwd(), "temp_contract.cdc");
    if (fs.existsSync(tempContractPath)) {
      fs.unlinkSync(tempContractPath);
    }
    
    return { success: false, error: error.message };
  }
}

// Check for Flow CLI
try {
  execSync('flow version', { stdio: 'pipe' });
  console.log("✅ Flow CLI is available");
} catch (error) {
  console.error("❌ Flow CLI not found. Please install Flow CLI first:");
  console.error("   Visit: https://developers.flow.com/tools/flow-cli/install");
  process.exit(1);
}

// Run deployment
deployContractWithCLI()
  .then((result) => {
    if (result.success) {
      console.log("\n🎊 Deployment Complete! Next steps:");
      console.log("1. Start your development server: npm run dev");
      console.log("2. Connect your Flow wallet in the app");
      console.log("3. Set up your NFT collection");
      console.log("4. Test achievement NFT minting");
    } else {
      console.error("\n💥 Deployment failed:", result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });