import * as fcl from "@onflow/fcl";

// Flow network configuration
export const FLOW_CONFIG = {
  // Use Flow Testnet for development
  "accessNode.api": "https://rest-testnet.onflow.org", // Flow Testnet REST API
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Flow Testnet Wallet Discovery
  "0xFungibleToken": "0x9a0766d93b6608b7", // Testnet FungibleToken contract
  "0xNonFungibleToken": "0x631e88ae7f1d7c20", // Testnet NonFungibleToken contract
  "0xFlowToken": "0x7e60df042a9c0868", // Testnet FlowToken contract
  "0xProfile": "", // We'll deploy our own contracts here
};

// Configure Flow Client Library (FCL)
export const initializeFlow = () => {
  // Configure FCL with Flow Testnet using environment variables
  fcl.config({
    "accessNode.api": import.meta.env.VITE_FLOW_ACCESS_NODE || FLOW_CONFIG["accessNode.api"],
    "discovery.wallet": import.meta.env.VITE_FLOW_DISCOVERY || FLOW_CONFIG["discovery.wallet"],
    "0xFungibleToken": FLOW_CONFIG["0xFungibleToken"],
    "0xNonFungibleToken": import.meta.env.VITE_NONFUNGIBLETOKEN_ADDRESS || FLOW_CONFIG["0xNonFungibleToken"],
    "0xFlowToken": FLOW_CONFIG["0xFlowToken"],
    "0xBookVerseNFT": import.meta.env.VITE_BOOKVERSE_CONTRACT_ADDRESS || "0x1cf42ad65f227d9d",
    "app.detail.title": "BookVerse",
    "app.detail.icon": "https://bookverse.app/favicon.ico",
    "app.detail.description": "Web3-powered social platform for readers",
  });

  console.log("Flow FCL configured for Testnet with contract:", import.meta.env.VITE_BOOKVERSE_CONTRACT_ADDRESS);
};

// Flow account and transaction utilities
export const FLOW_UTILS = {
  // Convert Flow amount to readable format
  formatFlowAmount: (amount: string): string => {
    return (parseFloat(amount) / 100000000).toFixed(2);
  },

  // Convert readable amount to Flow format
  parseFlowAmount: (amount: string): string => {
    return (parseFloat(amount) * 100000000).toString();
  },

  // Check if address is valid Flow address
  isValidFlowAddress: (address: string): boolean => {
    return /^0x[a-f0-9]{16}$/.test(address);
  },

  // Generate transaction ID
  generateTxId: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};