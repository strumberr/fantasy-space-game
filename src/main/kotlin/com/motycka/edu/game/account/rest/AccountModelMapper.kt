package com.motycka.edu.game.account.rest

import com.motycka.edu.game.account.model.Account

fun AccountRegistrationRequest.toAccount() = Account(
    id = null,
    name = name,
    username = username,
    password = password
)
