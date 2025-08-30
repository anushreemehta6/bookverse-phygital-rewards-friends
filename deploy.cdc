transaction(contractCode: String) {
    prepare(signer: AuthAccount) {
        signer.contracts.add(name: "BookVerseNFT", code: contractCode.utf8)
    }
}