package com.motycka.edu.game.account

import com.motycka.edu.game.account.rest.AccountRegistrationRequest
import com.motycka.edu.game.account.rest.toAccount
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/accounts")
class AccountController(
    private val accountService: AccountService
) {

    @PostMapping
    fun postAccount(
        @RequestBody account: AccountRegistrationRequest
    ) {
        accountService.createAccount(
            account = account.toAccount()
        )
    }

}
