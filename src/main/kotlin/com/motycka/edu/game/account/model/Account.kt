package com.motycka.edu.game.account.model


data class Account(
    val id: AccountId? = null,
    val name: String,
    val username: String,
    val password: String
)
