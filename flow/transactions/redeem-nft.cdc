/*
    Redeem NFT Transaction
    
    This transaction redeems a BookVerse NFT at a physical location,
    marking it as redeemed and recording the redemption details.
*/

import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS

transaction(nftID: UInt64, location: String) {
    let collection: &BookVerseNFT.Collection

    prepare(signer: &Account) {
        // Get the signer's collection
        self.collection = signer.storage.borrow<&BookVerseNFT.Collection>(
            from: BookVerseNFT.CollectionStoragePath
        ) ?? panic("Could not borrow collection reference")
    }

    execute {
        // Get the NFT reference
        let nftRef = self.collection.borrowBookVerseNFT(id: nftID)
            ?? panic("Could not borrow NFT reference")

        // Redeem the NFT
        nftRef.redeem(location: location)

        log("NFT ID ".concat(nftID.toString()).concat(" redeemed at ").concat(location))
    }
}