/*
    Get Collection IDs Script
    
    This script returns the IDs of all BookVerse NFTs owned by an account.
*/

import BookVerseNFT from 0xBOOKVERSE_CONTRACT_ADDRESS

access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    
    let collectionRef = account.capabilities.borrow<&{BookVerseNFT.CollectionPublic}>(
        BookVerseNFT.CollectionPublicPath
    ) ?? panic("Could not borrow collection reference")

    return collectionRef.getIDs()
}