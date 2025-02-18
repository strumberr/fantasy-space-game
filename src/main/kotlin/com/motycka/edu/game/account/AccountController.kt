package com.motycka.edu.game.account

import com.motycka.edu.game.account.model.Account
import com.motycka.edu.game.account.rest.AccountRegistrationRequest
import com.motycka.edu.game.account.rest.AccountResponse
import com.motycka.edu.game.account.rest.toAccount
import com.motycka.edu.game.account.rest.toAccountResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * This is example of a controller class that handles HTTP requests for the account resource with service dependency injection.
 */
@RestController
@RequestMapping("/api/accounts")
class AccountController(
    private val accountService: AccountService
) {

    @GetMapping("/{id}")
    fun getAccount(
        @PathVariable id: Long
    ): AccountResponse {
        return accountService.getAccount(id = id).toAccountResponse()
    }

    @PostMapping
    fun postAccount(
        @RequestBody account: AccountRegistrationRequest
    ) {
        accountService.createAccount(
            account = account.toAccount()
        )
    }

}
