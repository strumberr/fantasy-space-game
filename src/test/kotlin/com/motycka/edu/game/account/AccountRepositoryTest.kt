package com.motycka.edu.game.account

import com.motycka.edu.game.account.model.Account
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ContextConfiguration
import javax.sql.DataSource

@JdbcTest
@ContextConfiguration(classes = [AccountRepository::class])
@ComponentScan("com.motycka.edu.game.account")
class AccountRepositoryTest {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var accountRepository: AccountRepository

    @Autowired
    private lateinit var dataSource: DataSource

    private val johnDoe = Account(
        id = 1L,
        name = "John Doe",
        username = "johndoe",
        password = "password"
    )

    private val janeDoe = Account(
        id = 2L,
        name = "Jane Doe",
        username = "janedoe",
        password = "password"
    )

    @BeforeEach
    fun setUp() {
//        jdbcTemplate.execute("CREATE TABLE account (id BIGINT AUTO_INCREMENT, name VARCHAR(255), username VARCHAR(255), password VARCHAR(255))")
        jdbcTemplate.update("INSERT INTO account (name, username, password) VALUES (?, ?, ?)", johnDoe.name, johnDoe.username, johnDoe.password)
        jdbcTemplate.update("INSERT INTO account (name, username, password) VALUES (?, ?, ?)", janeDoe.name, janeDoe.username, janeDoe.password)
    }

    @Test
    fun `selectByUsername should return account when found`() {
        val result = accountRepository.selectByUsername("johndoe")
        assertEquals(johnDoe, result)
    }

    @Test
    fun `selectByUsername should return null when not found`() {
        val result = accountRepository.selectByUsername("unknown")
        assertNull(result)
    }

    @Test
    fun `insertAccount should return inserted account`() {
        val account = Account(3L, "Alice", "alice", "password")
        val result = accountRepository.insertAccount(account)

        assertNotNull(result)
        assertEquals(account.copy(id = result?.id), result)
    }
}
