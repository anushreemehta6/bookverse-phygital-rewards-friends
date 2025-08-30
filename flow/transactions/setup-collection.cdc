/*
    Setup Collection Transaction
    
    This transaction sets up a BookVerse NFT Collection for a user account
    that doesn't already have one. This must be called before the user
    can receive any BookVerse NFTs.
*/

import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKEN

transaction() {
    prepare(signer: &Account) {
        // Check if the user already has a collection
        if signer.storage.borrow<&BookVerseNFT.Collection>(from: BookVerseNFT.CollectionStoragePath) != nil {
            return
        }

        // Create a new empty collection
        let collection <- BookVerseNFT.createEmptyCollection(nftType: Type<@BookVerseNFT.NFT>())

        // Save it to the account
        signer.storage.save(<-collection, to: BookVerseNFT.CollectionStoragePath)

        // Create a public capability for the collection
        let collectionCap = signer.capabilities.storage.issue<&BookVerseNFT.Collection>(
            BookVerseNFT.CollectionStoragePath
        )
        signer.capabilities.publish(collectionCap, at: BookVerseNFT.CollectionPublicPath)
    }

    execute {
        log("BookVerse NFT Collection setup completed")
    }
}