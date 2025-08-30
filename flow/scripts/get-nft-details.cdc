/*
    Get NFT Details Script
    
    This script returns the details of a specific BookVerse NFT.
*/

import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS
import MetadataViews from 0xMETADATAVIEWS

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let achievementType: String
    access(all) let mintedAt: UFix64
    access(all) let userAddress: Address
    access(all) let metadata: {String: String}
    access(all) let isRedeemed: Bool
    access(all) let redeemedAt: UFix64?
    access(all) let redemptionLocation: String?
    access(all) let display: MetadataViews.Display?

    init(
        id: UInt64,
        achievementType: String,
        mintedAt: UFix64,
        userAddress: Address,
        metadata: {String: String},
        isRedeemed: Bool,
        redeemedAt: UFix64?,
        redemptionLocation: String?,
        display: MetadataViews.Display?
    ) {
        self.id = id
        self.achievementType = achievementType
        self.mintedAt = mintedAt
        self.userAddress = userAddress
        self.metadata = metadata
        self.isRedeemed = isRedeemed
        self.redeemedAt = redeemedAt
        self.redemptionLocation = redemptionLocation
        self.display = display
    }
}

access(all) fun main(address: Address, nftID: UInt64): NFTDetails? {
    let account = getAccount(address)
    
    let collectionRef = account.capabilities.borrow<&{BookVerseNFT.CollectionPublic}>(
        BookVerseNFT.CollectionPublicPath
    ) ?? return nil

    let nftRef = collectionRef.borrowBookVerseNFT(id: nftID) ?? return nil
    
    let display = nftRef.resolveView(Type<MetadataViews.Display>()) as! MetadataViews.Display?

    return NFTDetails(
        id: nftRef.id,
        achievementType: nftRef.achievementType,
        mintedAt: nftRef.mintedAt,
        userAddress: nftRef.userAddress,
        metadata: nftRef.metadata,
        isRedeemed: nftRef.isRedeemed,
        redeemedAt: nftRef.redeemedAt,
        redemptionLocation: nftRef.redemptionLocation,
        display: display
    )
}