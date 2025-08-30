/*
    BookVerse NFT Contract
    
    This contract defines the BookVerse achievement NFTs that users earn
    through reading activities and community engagement.
*/

import NonFungibleToken from 0x631e88ae7f1d7c20
import ViewResolver from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

access(all) contract BookVerseNFT: NonFungibleToken, ViewResolver {
    
    // Events
    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event Minted(id: UInt64, recipient: Address, achievementType: String, metadata: {String: String})
    access(all) event Redeemed(id: UInt64, owner: Address, location: String)

    // Named Paths
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    // The total number of BookVerse NFTs that have been minted
    access(all) var totalSupply: UInt64

    // Achievement types and their metadata
    access(all) let achievementTypes: {String: AchievementMetadata}

    // Struct to hold achievement metadata
    access(all) struct AchievementMetadata {
        access(all) let name: String
        access(all) let description: String
        access(all) let rarity: String
        access(all) let redeemableLocation: String
        access(all) let rewardValue: String
        access(all) let imageUrl: String
        access(all) let criteria: {String: UInt64}
        
        init(
            name: String, 
            description: String, 
            rarity: String, 
            redeemableLocation: String, 
            rewardValue: String,
            imageUrl: String,
            criteria: {String: UInt64}
        ) {
            self.name = name
            self.description = description
            self.rarity = rarity
            self.redeemableLocation = redeemableLocation
            self.rewardValue = rewardValue
            self.imageUrl = imageUrl
            self.criteria = criteria
        }
    }

    // A BookVerse NFT
    access(all) resource NFT: NonFungibleToken.NFT, ViewResolver.Resolver {
        // The unique ID for the NFT
        access(all) let id: UInt64
        
        // Achievement details
        access(all) let achievementType: String
        access(all) let mintedAt: UFix64
        access(all) let userAddress: Address
        access(all) let metadata: {String: String}
        access(all) var isRedeemed: Bool
        access(all) var redeemedAt: UFix64?
        access(all) var redemptionLocation: String?

        init(
            id: UInt64,
            achievementType: String,
            userAddress: Address,
            metadata: {String: String}
        ) {
            self.id = id
            self.achievementType = achievementType
            self.mintedAt = getCurrentBlock().timestamp
            self.userAddress = userAddress
            self.metadata = metadata
            self.isRedeemed = false
            self.redeemedAt = nil
            self.redemptionLocation = nil
        }

        // Function to redeem the NFT
        access(all) fun redeem(location: String) {
            pre {
                !self.isRedeemed: "NFT has already been redeemed"
            }
            
            self.isRedeemed = true
            self.redeemedAt = getCurrentBlock().timestamp
            self.redemptionLocation = location
            
            emit Redeemed(id: self.id, owner: self.userAddress, location: location)
        }

        // Function to get views for the NFT
        access(all) view fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Traits>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            let achievementMeta = BookVerseNFT.achievementTypes[self.achievementType]!
            
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: achievementMeta.name,
                        description: achievementMeta.description,
                        thumbnail: MetadataViews.HTTPFile(url: achievementMeta.imageUrl)
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://bookverse.app/nft/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: BookVerseNFT.CollectionStoragePath,
                        publicPath: BookVerseNFT.CollectionPublicPath,
                        providerPath: /private/BookVerseNFTCollectionProvider,
                        publicCollection: Type<&BookVerseNFT.Collection>(),
                        publicLinkedType: Type<&BookVerseNFT.Collection>(),
                        providerLinkedType: Type<&BookVerseNFT.Collection>(),
                        createEmptyCollectionFunction: (fun (): @{NonFungibleToken.Collection} {
                            return <-BookVerseNFT.createEmptyCollection(nftType: Type<@BookVerseNFT.NFT>())
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(url: "https://bookverse.app/logo.png"),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "BookVerse Achievement NFTs",
                        description: "Earn NFT rewards for your reading achievements and redeem them at partner bookstores.",
                        externalURL: MetadataViews.ExternalURL("https://bookverse.app"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/bookverseapp")
                        }
                    )
                case Type<MetadataViews.Traits>():
                    let traits: [MetadataViews.Trait] = []
                    traits.append(MetadataViews.Trait(name: "Achievement Type", value: self.achievementType, displayType: nil, rarity: nil))
                    traits.append(MetadataViews.Trait(name: "Rarity", value: achievementMeta.rarity, displayType: nil, rarity: nil))
                    traits.append(MetadataViews.Trait(name: "Redeemable At", value: achievementMeta.redeemableLocation, displayType: nil, rarity: nil))
                    traits.append(MetadataViews.Trait(name: "Reward Value", value: achievementMeta.rewardValue, displayType: nil, rarity: nil))
                    traits.append(MetadataViews.Trait(name: "Redeemed", value: self.isRedeemed, displayType: nil, rarity: nil))
                    
                    // Add custom metadata as traits
                    for key in self.metadata.keys {
                        traits.append(MetadataViews.Trait(name: key, value: self.metadata[key]!, displayType: nil, rarity: nil))
                    }
                    
                    return MetadataViews.Traits(traits)
            }
            return nil
        }
    }

    // Collection interface that allows users to manage their BookVerse NFTs
    access(all) resource interface CollectionPublic {
        access(all) fun deposit(token: @{NonFungibleToken.NFT})
        access(all) view fun getIDs(): [UInt64]
        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}?
        access(all) fun borrowBookVerseNFT(id: UInt64): &BookVerseNFT.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow BookVerse NFT reference: the ID of the returned reference is incorrect"
            }
        }
    }

    // Collection that holds a user's BookVerse NFTs
    access(all) resource Collection: 
        NonFungibleToken.Provider, 
        NonFungibleToken.Receiver, 
        NonFungibleToken.Collection, 
        NonFungibleToken.CollectionPublic, 
        ViewResolver.ResolverCollection,
        CollectionPublic 
    {
        // Dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}

        init () {
            self.ownedNFTs <- {}
        }

        // Withdraw removes an NFT from the collection and moves it to the caller
        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // Deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let token <- token as! @BookVerseNFT.NFT

            let id: UInt64 = token.id

            // Add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // GetIDs returns an array of the IDs that are in the collection
        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // BorrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return (&self.ownedNFTs[id] as &{NonFungibleToken.NFT}?)
        }

        // BorrowBookVerseNFT gets a reference to an NFT in the collection as a BookVerseNFT,
        // exposing all of its fields and methods, including ones specific to BookVerseNFT
        access(all) fun borrowBookVerseNFT(id: UInt64): &BookVerseNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                // Create an authorized reference to allow downcasting
                let ref = (&self.ownedNFTs[id] as &{NonFungibleToken.NFT}?)!
                return ref as! &BookVerseNFT.NFT
            }

            return nil
        }

        access(all) view fun borrowViewResolver(id: UInt64): &{ViewResolver.Resolver}? {
            let nft = (&self.ownedNFTs[id] as &{NonFungibleToken.NFT}?)
            if nft != nil {
                return nft! as &{ViewResolver.Resolver}
            }
            return nil
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            panic("implement me")
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            panic("implement me")
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- create Collection()
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // Public function that anyone can call to create a new empty collection
    access(all) fun createEmptyCollection(nftType: Type): @{NonFungibleToken.Collection} {
        return <- create Collection()
    }

    // Resource that an admin or something similar would own to be
    // able to mint new NFTs
    access(all) resource NFTMinter {

        // MintNFT mints a new NFT with a new ID
        // and deposit it in the recipients collection using their collection reference
        access(all) fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            achievementType: String,
            userAddress: Address,
            metadata: {String: String}
        ): UInt64 {
            pre {
                BookVerseNFT.achievementTypes.containsKey(achievementType): 
                    "Achievement type does not exist"
            }

            // Create a new NFT
            var newNFT <- create NFT(
                id: BookVerseNFT.totalSupply,
                achievementType: achievementType,
                userAddress: userAddress,
                metadata: metadata
            )

            let mintedID = newNFT.id

            // Deposit it in the recipient's account using their reference
            recipient.deposit(token: <-newNFT)

            BookVerseNFT.totalSupply = BookVerseNFT.totalSupply + UInt64(1)

            emit Minted(id: mintedID, recipient: userAddress, achievementType: achievementType, metadata: metadata)

            return mintedID
        }

        // Function to add new achievement types
        access(all) fun addAchievementType(
            key: String,
            metadata: AchievementMetadata
        ) {
            BookVerseNFT.achievementTypes[key] = metadata
        }
    }

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<MetadataViews.NFTCollectionData>(),
            Type<MetadataViews.NFTCollectionDisplay>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<MetadataViews.NFTCollectionData>():
                return MetadataViews.NFTCollectionData(
                    storagePath: BookVerseNFT.CollectionStoragePath,
                    publicPath: BookVerseNFT.CollectionPublicPath,
                    providerPath: /private/BookVerseNFTCollectionProvider,
                    publicCollection: Type<&BookVerseNFT.Collection>(),
                    publicLinkedType: Type<&BookVerseNFT.Collection>(),
                    providerLinkedType: Type<&BookVerseNFT.Collection>(),
                    createEmptyCollectionFunction: (fun (): @{NonFungibleToken.Collection} {
                        return <-BookVerseNFT.createEmptyCollection(nftType: Type<@BookVerseNFT.NFT>())
                    })
                )
            case Type<MetadataViews.NFTCollectionDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(url: "https://bookverse.app/logo.png"),
                    mediaType: "image/png"
                )
                return MetadataViews.NFTCollectionDisplay(
                    name: "BookVerse Achievement NFTs",
                    description: "Earn NFT rewards for your reading achievements and redeem them at partner bookstores.",
                    externalURL: MetadataViews.ExternalURL("https://bookverse.app"),
                    squareImage: media,
                    bannerImage: media,
                    socials: {
                        "twitter": MetadataViews.ExternalURL("https://twitter.com/bookverseapp")
                    }
                )
        }
        return nil
    }

    init() {
        // Initialize the total supply
        self.totalSupply = 0

        // Set the named paths
        self.CollectionStoragePath = /storage/BookVerseNFTCollection
        self.CollectionPublicPath = /public/BookVerseNFTCollection
        self.MinterStoragePath = /storage/BookVerseNFTMinter

        // Initialize achievement types
        self.achievementTypes = {}

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        
        // Add default achievement types
        minter.addAchievementType(
            key: "golden_bookmark",
            metadata: AchievementMetadata(
                name: "Golden Bookmark",
                description: "Earned for writing 10 exceptional book reviews",
                rarity: "Rare",
                redeemableLocation: "Barnes & Noble",
                rewardValue: "$15 Discount",
                imageUrl: "https://bookverse.app/nfts/golden_bookmark.png",
                criteria: {"reviews": 10, "likes": 50}
            )
        )
        
        minter.addAchievementType(
            key: "reading_streak_master",
            metadata: AchievementMetadata(
                name: "Reading Streak Master",
                description: "Complete 30 days of consecutive reading activity",
                rarity: "Uncommon",
                redeemableLocation: "Any Partner Store",
                rewardValue: "10% Off Purchase",
                imageUrl: "https://bookverse.app/nfts/reading_streak_master.png",
                criteria: {"reading_streak": 30}
            )
        )
        
        minter.addAchievementType(
            key: "community_champion",
            metadata: AchievementMetadata(
                name: "Community Champion",
                description: "Awarded for being top contributor in your genre community",
                rarity: "Epic",
                redeemableLocation: "Local Independent Bookstores",
                rewardValue: "Free Book + Coffee",
                imageUrl: "https://bookverse.app/nfts/community_champion.png",
                criteria: {"community_points": 500, "posts": 20}
            )
        )
        
        minter.addAchievementType(
            key: "genre_explorer",
            metadata: AchievementMetadata(
                name: "Genre Explorer",
                description: "Read and review books from 5 different genres",
                rarity: "Common",
                redeemableLocation: "Online Bookstores",
                rewardValue: "$5 Discount",
                imageUrl: "https://bookverse.app/nfts/genre_explorer.png",
                criteria: {"unique_genres": 5, "reviews": 5}
            )
        )

        self.account.storage.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}