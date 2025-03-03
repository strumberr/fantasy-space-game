package com.motycka.edu.game.match.model

import com.motycka.edu.game.match.MatchRepository

data class Match(
    val id: Long,
    val challengerId: Long,
    val opponentId: Long,
    val matchOutcome: String,
    val challengerXp: Int,
    val opponentXp: Int,
    val rounds: List<MatchRepository.Round>
)
