package com.motycka.edu.game.account

import com.motycka.edu.game.account.model.Account

object AccountFixtures {
    val UNKNOWN = "unknown"
    val DEVELOPER = Account(
        id = null,
        name = "The Developer",
        username = "developer",
        password = "password"
    )
    val TESTER = Account(
        id = null,
        name = "The Tester",
        username = "tester",
        password = "password"
    )
}
