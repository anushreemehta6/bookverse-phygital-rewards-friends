/*
    Deploy BookVerse NFT Contract Transaction
    
    This transaction deploys the BookVerse NFT contract to the Flow blockchain.
    It should be run by the account that will own the contract.
*/

transaction(contractCode: String) {
    prepare(signer: &Account) {
        // Deploy the contract to the signer's account
        signer.contracts.add(
            name: "BookVerseNFT", 
            code: contractCode.utf8
        )
    }
}