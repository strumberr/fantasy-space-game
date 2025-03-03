package com.motycka.edu.game.match

import com.motycka.edu.game.account.AccountService
import com.motycka.edu.game.match.model.Match
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.motycka.edu.game.character.model.Character

// Request DTO for creating a match.
data class MatchRequest(
    val rounds: Int,
    val challengerId: Long,
    val opponentId: Long
)

// Simple response for POST /api/matches.
data class MatchResponse(
    val id: Long,
    val challengerId: Long,
    val opponentId: Long,
    val matchOutcome: String,
    val challengerXp: Int,
    val opponentXp: Int
) {
    constructor(match: Match) : this(
        match.id,
        match.challengerId,
        match.opponentId,
        match.matchOutcome,
        match.challengerXp,
        match.opponentXp
    )
}

// Detailed response for GET /api/matches.
data class CharacterMatchInfo(
    val id: String,
    val name: String,
    val characterClass: String,
    val level: String,
    val experienceTotal: Int,
    val experienceGained: Int,
    val isVictor: Boolean
)

data class RoundResponse(
    val round: Int,
    val characterId: String,
    val healthDelta: Int,
    val staminaDelta: Int,
    val manaDelta: Int
)

data class GetMatchResponse(
    val id: String,
    val challenger: CharacterMatchInfo,
    val opponent: CharacterMatchInfo,
    val rounds: List<RoundResponse>
)

@RestController
@RequestMapping("/api/matches")
class MatchController(
    private val matchService: MatchService,
    private val accountService: AccountService,
    private val characterService: com.motycka.edu.game.character.CharacterService
) {

    @PostMapping
    fun createMatch(@RequestBody matchRequest: MatchRequest): ResponseEntity.BodyBuilder {
        val match = matchService.createMatch(
            rounds = matchRequest.rounds,
            challengerId = matchRequest.challengerId,
            opponentId = matchRequest.opponentId
        )
        return ResponseEntity.ok()

    }

    @GetMapping
    fun getMatches(): ResponseEntity<List<GetMatchResponse>> {
        val matches = matchService.getAllMatches()
        val responses = matches.map { match ->
            val challengerCharacter: Character = characterService.getCharacterById(match.challengerId)
            val opponentCharacter: Character = characterService.getCharacterById(match.opponentId)


            val challengerInfo = CharacterMatchInfo(
                id = challengerCharacter.id.toString(),
                name = challengerCharacter.name,
                characterClass = challengerCharacter.characterClass,
                level = (challengerCharacter.experience / 400).toString(),
                experienceTotal = challengerCharacter.experience,
                experienceGained = match.challengerXp,
                isVictor = match.challengerXp > match.opponentXp
            )
            val opponentInfo = CharacterMatchInfo(
                id = opponentCharacter.id.toString(),
                name = opponentCharacter.name,
                characterClass = opponentCharacter.characterClass,
                level = (opponentCharacter.experience / 400).toString(),
                experienceTotal = opponentCharacter.experience,
                experienceGained = match.opponentXp,
                isVictor = match.opponentXp > match.challengerXp
            )

            val rounds = matchService.getRoundsForMatch(match.id).map { r ->
                RoundResponse(
                    round = r.round,
                    characterId = r.characterId.toString(),
                    healthDelta = r.healthDelta,
                    staminaDelta = r.staminaDelta,
                    manaDelta = r.manaDelta
                )
            }

            GetMatchResponse(
                id = match.id.toString(),
                challenger = challengerInfo,
                opponent = opponentInfo,
                rounds = rounds
            )
        }
        return ResponseEntity.ok(responses)
    }
}
