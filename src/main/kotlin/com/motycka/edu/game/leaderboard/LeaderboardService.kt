package com.motycka.edu.game.leaderboard

import com.motycka.edu.game.account.AccountService
import com.motycka.edu.game.character.CharacterResponse
import org.springframework.stereotype.Service

// Response DTO for the leaderboard entry.
data class LeaderboardResponse(
    val position: Int,
    val character: CharacterResponse,
    val wins: Int,
    val losses: Int,
    val draws: Int
)

@Service
class LeaderboardService(
    private val leaderboardRepository: LeaderboardRepository,
    private val accountService: AccountService
) {
    fun getLeaderboard(filterClass: String?): List<LeaderboardResponse> {
        // Convert provided class filter to uppercase to match stored values.
        val normalizedFilter = filterClass?.uppercase()
        val currentAccountId = accountService.getCurrentAccountId()
        val rows = leaderboardRepository.getLeaderboard(normalizedFilter)
        var position = 1
        return rows.map { row ->
            // Calculate level and determine if the character should level up.
            val level = (row.experience / 400).toString()
            val shouldLevelUp = row.experience % 400 == 0
            // Determine if the character belongs to the current account.
            val isOwner = row.accountId == currentAccountId

            // Reuse the existing CharacterResponse model.
            val characterResponse = CharacterResponse(
                id = row.characterId.toString(),
                name = row.name,
                health = row.health,
                attackPower = row.attack,
                stamina = row.stamina,
                defensePower = row.defense,
                mana = row.mana,
                healingPower = row.healing,
                characterClass = row.characterClass,
                level = level,
                experience = row.experience,
                shouldLevelUp = shouldLevelUp,
                isOwner = isOwner
            )
            LeaderboardResponse(
                position = position++,
                character = characterResponse,
                wins = row.wins,
                losses = row.losses,
                draws = row.draws
            )
        }
    }
}
