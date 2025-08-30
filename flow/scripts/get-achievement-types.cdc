/*
    Get Achievement Types Script
    
    This script returns all available achievement types and their metadata.
*/

import BookVerseNFT from 0x1cf42ad65f227d9d

access(all) fun main(): {String: BookVerseNFT.AchievementMetadata} {
    let achievements: {String: BookVerseNFT.AchievementMetadata} = {}
    let achievementKeys = BookVerseNFT.achievementTypes.keys
    
    for key in achievementKeys {
        if let achievementMeta = BookVerseNFT.achievementTypes[key] {
            let criteriaDict: {String: UInt64} = {}
            for criteriaKey in achievementMeta.criteria.keys {
                criteriaDict[criteriaKey] = achievementMeta.criteria[criteriaKey]!
            }
            
            achievements[key] = BookVerseNFT.AchievementMetadata(
                name: achievementMeta.name,
                description: achievementMeta.description,
                rarity: achievementMeta.rarity,
                redeemableLocation: achievementMeta.redeemableLocation,
                rewardValue: achievementMeta.rewardValue,
                imageUrl: achievementMeta.imageUrl,
                criteria: criteriaDict
            )
        }
    }
    
    return achievements
}