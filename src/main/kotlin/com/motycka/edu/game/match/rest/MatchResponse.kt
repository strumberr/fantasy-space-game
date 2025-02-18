package com.motycka.edu.game.match.rest

import com.motycka.edu.game.match.model.MatchId

data class MatchResponse(
    val id: MatchId,
    val challenger: MatchCharacterResponse,
    val opponent: MatchCharacterResponse,
    val rounds: List<MatchRoundResponse>,
)
