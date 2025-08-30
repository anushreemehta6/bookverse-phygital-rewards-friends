/*
    Mint Achievement NFT Transaction
    
    This transaction mints a new BookVerse achievement NFT and deposits it
    into the recipient's collection.
*/

import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKEN

transaction(
    recipientAddress: Address,
    achievementType: String,
    metadata: {String: String}
) {
    let minter: &BookVerseNFT.NFTMinter
    let recipient: &{NonFungibleToken.CollectionPublic}

    prepare(signer: &Account) {
        // Get the minter reference from the signer's account
        self.minter = signer.storage.borrow<&BookVerseNFT.NFTMinter>(
            from: BookVerseNFT.MinterStoragePath
        ) ?? panic("Could not borrow minter reference")

        // Get the recipient's collection capability
        let recipientAccount = getAccount(recipientAddress)
        self.recipient = recipientAccount.capabilities.borrow<&{NonFungibleToken.CollectionPublic}>(
            BookVerseNFT.CollectionPublicPath
        ) ?? panic("Could not borrow recipient collection reference")
    }

    execute {
        // Mint the NFT and deposit it into the recipient's collection
        let mintedID = self.minter.mintNFT(
            recipient: self.recipient,
            achievementType: achievementType,
            userAddress: recipientAddress,
            metadata: metadata
        )

        log("BookVerse NFT minted with ID: ".concat(mintedID.toString()))
        log("Achievement type: ".concat(achievementType))
        log("Recipient: ".concat(recipientAddress.toString()))
    }
}