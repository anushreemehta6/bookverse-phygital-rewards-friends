/**
 * BookVerse Contract Deployment Script
 * 
 * This script handles the deployment of BookVerse NFT contracts to Flow blockchain.
 * Run with: node flow/deploy.js --deploy
 */

import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: '.env.local' });

// Configure FCL for Testnet
fcl.config({
  "accessNode.api": process.env.VITE_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org",
  "discovery.wallet": process.env.VITE_FLOW_DISCOVERY || "https://fcl-discovery.onflow.org/testnet/authn",
  "0xNonFungibleToken": process.env.VITE_NONFUNGIBLETOKEN_ADDRESS || "0x631e88ae7f1d7c20",
  "0xMetadataViews": process.env.VITE_METADATAVIEWS_ADDRESS || "0x631e88ae7f1d7c20",
  "0xViewResolver": process.env.VITE_VIEWRESOLVER_ADDRESS || "0x631e88ae7f1d7c20"
});

// Set up admin account for deployment
const ADMIN_PRIVATE_KEY = process.env.FLOW_ADMIN_PRIVATE_KEY;
const ADMIN_ADDRESS = process.env.FLOW_ADMIN_ADDRESS;

if (!ADMIN_PRIVATE_KEY || !ADMIN_ADDRESS) {
  console.error("❌ Missing FLOW_ADMIN_PRIVATE_KEY or FLOW_ADMIN_ADDRESS in .env.local");
  process.exit(1);
}

// Configure authorization
fcl.config({
  "fcl.authz": fcl.authz
});

async function deployContract() {
  try {
    console.log("🚀 Starting BookVerse NFT contract deployment...");

    // Read the contract code
    const contractPath = path.join(process.cwd(), "flow/contracts/BookVerseNFT.cdc");
    const contractCode = fs.readFileSync(contractPath, "utf8");

    // Replace import addresses with testnet addresses
    const processedCode = contractCode
      .replace(/from \"\.\/standards\/NonFungibleToken\.cdc\"/, "from 0x631e88ae7f1d7c20")
      .replace(/from \"\.\/standards\/ViewResolver\.cdc\"/, "from 0x631e88ae7f1d7c20")  
      .replace(/from \"\.\/standards\/MetadataViews\.cdc\"/, "from 0x631e88ae7f1d7c20");

    console.log("📝 Contract code processed for deployment");

    // Deploy the contract
    const deployTxCode = `
      transaction(contractCode: String) {
        prepare(signer: &Account) {
          signer.contracts.add(
            name: "BookVerseNFT", 
            code: contractCode.utf8
          )
        }
      }
    `;

    const response = await fcl.mutate({
      cadence: deployTxCode,
      args: (arg, t) => [
        arg(processedCode, t.String)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999
    });

    console.log("⏳ Transaction submitted:", response.transactionId);

    const result = await fcl.tx(response.transactionId).onceSealed();
    
    if (result.status === 4) {
      console.log("✅ BookVerse NFT contract deployed successfully!");
      console.log("📋 Transaction ID:", response.transactionId);
      console.log("🏠 Contract Address:", result.events[0]?.data?.address || "Check transaction details");
    } else {
      console.error("❌ Deployment failed:", result);
    }

    return result;
  } catch (error) {
    console.error("💥 Deployment error:", error);
    throw error;
  }
}

async function setupCollection(userAddress) {
  try {
    console.log(`🔧 Setting up collection for user: ${userAddress}`);

    const setupTxCode = `
      import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS
      import NonFungibleToken from 0x631e88ae7f1d7c20

      transaction() {
        prepare(signer: &Account) {
          if signer.storage.borrow<&BookVerseNFT.Collection>(from: BookVerseNFT.CollectionStoragePath) != nil {
            return
          }

          let collection <- BookVerseNFT.createEmptyCollection(nftType: Type<@BookVerseNFT.NFT>())
          signer.storage.save(<-collection, to: BookVerseNFT.CollectionStoragePath)

          let collectionCap = signer.capabilities.storage.issue<&BookVerseNFT.Collection>(
            BookVerseNFT.CollectionStoragePath
          )
          signer.capabilities.publish(collectionCap, at: BookVerseNFT.CollectionPublicPath)
        }
      }
    `;

    const response = await fcl.mutate({
      cadence: setupTxCode,
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999
    });

    const result = await fcl.tx(response.transactionId).onceSealed();
    
    if (result.status === 4) {
      console.log("✅ Collection setup completed!");
    } else {
      console.error("❌ Collection setup failed:", result);
    }

    return result;
  } catch (error) {
    console.error("💥 Collection setup error:", error);
    throw error;
  }
}

// Export functions for use in other scripts
export { deployContract, setupCollection };

// Run deployment if this script is executed directly
if (process.argv[2] === "--deploy") {
  deployContract()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}