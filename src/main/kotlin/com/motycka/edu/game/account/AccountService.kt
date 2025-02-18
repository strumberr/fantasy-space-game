package com.motycka.edu.game.account

import com.motycka.edu.game.account.model.Account
import com.motycka.edu.game.account.model.AccountId
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

private val logger = KotlinLogging.logger {}

/**
 * This is example of service implementation with repository dependency injection.
 */
@Service
class AccountService(
    private val accountRepository: AccountRepository,
) {

    fun getAccount(id: AccountId): Account {
        logger.debug { "Getting user by id $id" }
        return when {
            getCurrentAccountId() != id -> null
            else -> accountRepository.selectById(id = id)
        } ?: throw UsernameNotFoundException(id.toString())
    }

    fun getCurrentAccountId(): AccountId {
        val authentication = SecurityContextHolder.getContext().authentication
        val principal = authentication.principal
        return if (principal is UserDetails) {
            accountRepository.selectByUsername(principal.username)?.id ?: throw UsernameNotFoundException(principal.username)
        } else {
            error("Unknown principal type: $principal")
        }
    }

    fun getByUsername(username: String): Account? {
        logger.debug { "Getting user $username" }
        return accountRepository.selectByUsername(username = username)
    }

    fun createAccount(account: Account): Account {
        logger.debug { "Creating new user: $account" }
        return accountRepository.insertAccount(account = account) ?: error(CREATE_ERROR)
    }


    companion object {
        const val CREATE_ERROR = "Account could not be created."
    }
}
