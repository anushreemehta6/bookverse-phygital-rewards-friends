import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { StreakData } from '@/lib/streakTracker';

export interface FlowNFT {
  id: string;
  achievementType: string;
  mintedAt: number;
  userAddress: string;
  metadata: Record<string, string>;
  isRedeemed: boolean;
  redeemedAt?: number;
  redemptionLocation?: string;
  display?: {
    name: string;
    description: string;
    thumbnail: string;
  };
}

export interface AchievementCriteria {
  reviews?: number;
  likes?: number;
  reading_streak?: number;
  community_points?: number;
  posts?: number;
  unique_genres?: number;
}

export class FlowNFTService {
  private static CONTRACT_ADDRESS = import.meta.env.VITE_BOOKVERSE_CONTRACT_ADDRESS || '0x1cf42ad65f227d9d';

  /**
   * Check if user's collection is set up
   */
  static async isCollectionSetup(userAddress: string): Promise<boolean> {
    try {
      const script = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          return account.capabilities.borrow<&{BookVerseNFT.CollectionPublic}>(
            BookVerseNFT.CollectionPublicPath
          ) != nil
        }
      `;

      const result = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(userAddress, t.Address)]
      });

      return result;
    } catch (error) {
      console.error('Failed to check collection setup:', error);
      return false;
    }
  }

  /**
   * Setup NFT collection for user
   */
  static async setupCollection(): Promise<string | null> {
    try {
      const transaction = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}
        import NonFungibleToken from 0x631e88ae7f1d7c20

        transaction() {
          prepare(signer: &Account) {
            if signer.storage.borrow<&BookVerseNFT.Collection>(from: BookVerseNFT.CollectionStoragePath) != nil {
              return
            }

            let collection <- BookVerseNFT.createEmptyCollection(nftType: Type<@BookVerseNFT.NFT>())
            signer.storage.save(<-collection, to: BookVerseNFT.CollectionStoragePath)

            let collectionCap = signer.capabilities.storage.issue<&BookVerseNFT.Collection>(
              BookVerseNFT.CollectionStoragePath
            )
            signer.capabilities.publish(collectionCap, at: BookVerseNFT.CollectionPublicPath)
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: transaction,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error('Failed to setup collection:', error);
      return null;
    }
  }

  /**
   * Get user's NFT collection
   */
  static async getUserNFTs(userAddress: string): Promise<FlowNFT[]> {
    try {
      const script = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}
        import MetadataViews from 0x631e88ae7f1d7c20

        access(all) fun main(address: Address): [BookVerseNFT.NFTDetails] {
          let account = getAccount(address)
          let collectionRef = account.capabilities.borrow<&{BookVerseNFT.CollectionPublic}>(
            BookVerseNFT.CollectionPublicPath
          ) ?? return []

          let ids = collectionRef.getIDs()
          let nfts: [BookVerseNFT.NFTDetails] = []

          for id in ids {
            if let nftRef = collectionRef.borrowBookVerseNFT(id: id) {
              let display = nftRef.resolveView(Type<MetadataViews.Display>()) as! MetadataViews.Display?
              
              nfts.append(BookVerseNFT.NFTDetails(
                id: nftRef.id,
                achievementType: nftRef.achievementType,
                mintedAt: nftRef.mintedAt,
                userAddress: nftRef.userAddress,
                metadata: nftRef.metadata,
                isRedeemed: nftRef.isRedeemed,
                redeemedAt: nftRef.redeemedAt,
                redemptionLocation: nftRef.redemptionLocation,
                display: display
              ))
            }
          }

          return nfts
        }
      `;

      const result = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(userAddress, t.Address)]
      });

      return result.map((nft: any) => ({
        id: nft.id.toString(),
        achievementType: nft.achievementType,
        mintedAt: nft.mintedAt,
        userAddress: nft.userAddress,
        metadata: nft.metadata,
        isRedeemed: nft.isRedeemed,
        redeemedAt: nft.redeemedAt,
        redemptionLocation: nft.redemptionLocation,
        display: nft.display ? {
          name: nft.display.name,
          description: nft.display.description,
          thumbnail: nft.display.thumbnail.uri
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }

  /**
   * Check if user qualifies for achievement NFTs
   */
  static checkAchievementEligibility(
    userStats: {
      reviews: number;
      likes: number;
      streakData: StreakData;
      communityPoints: number;
      posts: number;
      uniqueGenres: number;
    },
    existingNFTs: FlowNFT[]
  ): string[] {
    const eligibleAchievements: string[] = [];
    const mintedTypes = new Set(existingNFTs.map(nft => nft.achievementType));

    // Golden Bookmark: 10 reviews with 50+ likes total
    if (!mintedTypes.has('golden_bookmark') && 
        userStats.reviews >= 10 && userStats.likes >= 50) {
      eligibleAchievements.push('golden_bookmark');
    }

    // Reading Streak Master: 30-day streak
    if (!mintedTypes.has('reading_streak_master') && 
        userStats.streakData.current_streak >= 30) {
      eligibleAchievements.push('reading_streak_master');
    }

    // Community Champion: 500 community points and 20 posts
    if (!mintedTypes.has('community_champion') && 
        userStats.communityPoints >= 500 && userStats.posts >= 20) {
      eligibleAchievements.push('community_champion');
    }

    // Genre Explorer: 5 unique genres with 5 reviews
    if (!mintedTypes.has('genre_explorer') && 
        userStats.uniqueGenres >= 5 && userStats.reviews >= 5) {
      eligibleAchievements.push('genre_explorer');
    }

    return eligibleAchievements;
  }

  /**
   * Mint achievement NFT (requires admin authorization)
   */
  static async mintAchievementNFT(
    recipientAddress: string,
    achievementType: string,
    metadata: Record<string, string> = {}
  ): Promise<string | null> {
    try {
      // Add achievement-specific metadata
      const enrichedMetadata = {
        ...metadata,
        mintedAt: Date.now().toString(),
        achievementType: achievementType
      };

      const transaction = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}
        import NonFungibleToken from 0x631e88ae7f1d7c20

        transaction(
          recipientAddress: Address,
          achievementType: String,
          metadata: {String: String}
        ) {
          let minter: &BookVerseNFT.NFTMinter
          let recipient: &{NonFungibleToken.CollectionPublic}

          prepare(signer: &Account) {
            self.minter = signer.storage.borrow<&BookVerseNFT.NFTMinter>(
              from: BookVerseNFT.MinterStoragePath
            ) ?? panic("Could not borrow minter reference")

            let recipientAccount = getAccount(recipientAddress)
            self.recipient = recipientAccount.capabilities.borrow<&{NonFungibleToken.CollectionPublic}>(
              BookVerseNFT.CollectionPublicPath
            ) ?? panic("Could not borrow recipient collection reference")
          }

          execute {
            let mintedID = self.minter.mintNFT(
              recipient: self.recipient,
              achievementType: achievementType,
              userAddress: recipientAddress,
              metadata: metadata
            )

            log("BookVerse NFT minted with ID: ".concat(mintedID.toString()))
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(recipientAddress, t.Address),
          arg(achievementType, t.String),
          arg(
            Object.keys(enrichedMetadata).map(key => ({ key, value: enrichedMetadata[key] })),
            t.Dictionary([t.String, t.String])
          )
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error('Failed to mint achievement NFT:', error);
      return null;
    }
  }

  /**
   * Redeem NFT at physical location
   */
  static async redeemNFT(nftId: string, location: string): Promise<string | null> {
    try {
      const transaction = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}

        transaction(nftID: UInt64, location: String) {
          let collection: &BookVerseNFT.Collection

          prepare(signer: &Account) {
            self.collection = signer.storage.borrow<&BookVerseNFT.Collection>(
              from: BookVerseNFT.CollectionStoragePath
            ) ?? panic("Could not borrow collection reference")
          }

          execute {
            let nftRef = self.collection.borrowBookVerseNFT(id: nftID)
              ?? panic("Could not borrow NFT reference")

            nftRef.redeem(location: location)
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(parseInt(nftId), t.UInt64),
          arg(location, t.String)
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error('Failed to redeem NFT:', error);
      return null;
    }
  }

  /**
   * Get available achievement types
   */
  static async getAchievementTypes(): Promise<Record<string, any>> {
    try {
      const script = `
        import BookVerseNFT from ${this.CONTRACT_ADDRESS}
        
        access(all) fun main(): {String: BookVerseNFT.AchievementMetadata} {
          return BookVerseNFT.achievementTypes
        }
      `;

      const result = await fcl.query({ cadence: script });
      return result;
    } catch (error) {
      console.error('Failed to get achievement types:', error);
      return {};
    }
  }
}