package com.motycka.edu.game.match.model

import com.motycka.edu.game.character.model.Character
import com.motycka.edu.game.account.model.AccountId

data class MatchResultWithCharacters(
    val challenger: Character,
    val challengerExperience: Int,
    val opponent: Character,
    val opponentExperience: Int,
    val match: MatchResult,
    val rounds: List<MatchRoundResult>,
    val currentAccountId: AccountId
)
