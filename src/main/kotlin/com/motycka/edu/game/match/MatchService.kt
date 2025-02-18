package com.motycka.edu.game.match

import com.motycka.edu.game.character.CharacterService
import com.motycka.edu.game.character.model.Character
import com.motycka.edu.game.character.rest.CharacterId
import com.motycka.edu.game.character.rest.CharactersFilter
import com.motycka.edu.game.leaderboard.LeaderboardService
import com.motycka.edu.game.match.model.MatchResult
import com.motycka.edu.game.match.model.MatchResultWithCharacters
import com.motycka.edu.game.match.model.MatchRoundResult
import com.motycka.edu.game.account.AccountService
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val characterService: CharacterService,
    private val accountService: AccountService,
    private val leaderboardService: LeaderboardService
) {

    fun getMatches(): List<MatchResultWithCharacters> {
        val matches = matchRepository.selectMatches()
        val characters = characterService.getCharacters(
            CharactersFilter(
                ids = matches.flatMap { listOf(it.challengerId, it.opponentId) }.toSet(),
                includeChallengers = true,
                includeOpponents = true
            )
        )
        return matchRepository.selectMatches().map { match ->
            val challenger = characters.find { it.characterId == match.challengerId }!! // TODO
            val opponent = characters.find { it.characterId == match.opponentId }!! // TODO

            MatchResultWithCharacters(
                challenger = challenger,
                challengerExperience = 100,
                opponent = opponent,
                opponentExperience = 100,
                match = match,
                rounds = matchRepository.selectRounds(match.id!!), // TODO
                currentAccountId = accountService.getCurrentAccountId()
            )
        }
    }

    @Transactional
    fun doMatch(
        rounds: Int,
        challengerId: CharacterId,
        opponentId: CharacterId
    ): MatchResultWithCharacters {
        return match(
            rounds = rounds,
            challenger = characterService.getCharacter(challengerId),
            opponent = characterService.getCharacter(opponentId)
        )
    }

    private fun match(
        rounds: Int,
        challenger: Character,
        opponent: Character
    ): MatchResultWithCharacters {
        var round = 0

        // TODO collect while condition is true
        val roundResults = (0 until rounds).mapNotNull {
            if (challenger.getStats().health > 0 && opponent.getStats().health > 0) {
                round(round++, challenger, opponent)
            } else null
        }.flatten()

        val victorId = when {
            challenger.getStats().health <= 0 && opponent.getStats().health > 0 -> {
                logger.info { ("\n${opponent.name} is the victor in round $round!") }
                opponent
            }
            opponent.getStats().health <= 0 && challenger.getStats().health > 0 -> {
                logger.info { "\n${challenger.name} is the victor in round $round!" }
                challenger
            }
            else -> {
                logger.info { "\nIt's a draw!" }
                null
            }
        }?.characterId

        val challengerExperience = 100
        val opponentExperience = 100

        val matchResult = matchRepository.insertMatch(
            MatchResult(
                challengerId = challenger.characterId,
                challengerExperience = challengerExperience,
                opponentId = opponent.characterId,
                opponentExperience = opponentExperience,
                victorId = victorId,
            )
        )

        val rounds = roundResults.flatMap { roundResult ->
            matchRepository.insertRound(matchResult.id!!, roundResult)
        }

        // update stats
        with (challenger) {
            val isVictor = characterId == victorId
            leaderboardService.updateLeaderboard(
                characterId = characterId,
                win = isVictor,
                loss = !isVictor
            )

            characterService.updateExperience(characterId, challengerExperience)
        }
        with (opponent) {
            val isVictor = characterId == victorId
            leaderboardService.updateLeaderboard(
                characterId = characterId,
                win = isVictor,
                loss = !isVictor
            )

            characterService.updateExperience(characterId, opponentExperience)
        }

        return MatchResultWithCharacters(
            challenger = challenger,
            challengerExperience = challengerExperience,
            opponent = opponent,
            opponentExperience = opponentExperience,
            match = matchResult,
            rounds = rounds,
            currentAccountId = accountService.getCurrentAccountId()
        )
    }

    private fun round(round: Int, challenger: Character, opponent: Character): List<MatchRoundResult> {
        val challengerStatsBefore = challenger.getStats()
        val opponentStatsBefore = opponent.getStats()

        challenger.beforeRound()
        opponent.beforeRound()


        challenger.attack(opponent)
        opponent.attack(challenger)

        // new
        challenger.afterRound()
        opponent.afterRound()

        val challengerStatsAfter = challenger.getStats()
        val opponentStatsAfter = opponent.getStats()

        logger.info { "[Round $round] Challenger: $challengerStatsBefore -> $challengerStatsAfter" }
        logger.info { "[Round $round] Opponent: $opponentStatsBefore -> $opponentStatsAfter" }

        return listOf(
            MatchRoundResult(
                round = round,
                characterId = challenger.characterId,
                healthDelta = challengerStatsBefore.health - challengerStatsAfter.health,
                staminaDelta = challengerStatsBefore.stamina - challengerStatsAfter.stamina,
                manaDelta = challengerStatsBefore.mana - challengerStatsAfter.mana
            ),
            MatchRoundResult(
                round = round,
                characterId = opponent.characterId,
                healthDelta = opponentStatsBefore.health - opponentStatsAfter.health,
                staminaDelta = opponentStatsBefore.stamina - opponentStatsAfter.stamina,
                manaDelta = opponentStatsBefore.mana - opponentStatsAfter.mana
            )
        )
    }

}
