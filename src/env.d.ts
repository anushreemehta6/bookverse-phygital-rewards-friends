/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FLOW_NETWORK: string
  readonly VITE_BOOKVERSE_CONTRACT_ADDRESS: string
  readonly VITE_NONFUNGIBLETOKEN_ADDRESS: string
  readonly VITE_METADATAVIEWS_ADDRESS: string
  readonly VITE_VIEWRESOLVER_ADDRESS: string
  readonly VITE_FLOW_ACCESS_NODE: string
  readonly VITE_FLOW_DISCOVERY: string
  readonly VITE_PARTNER_LOCATIONS: string
  readonly VITE_ENABLE_NFT_MINTING: string
  readonly VITE_ENABLE_PHYGITAL_REDEMPTION: string
  readonly VITE_ENABLE_ACHIEVEMENT_TRACKING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}