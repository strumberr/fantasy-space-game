package com.motycka.edu.game.config

import com.motycka.edu.game.account.AccountService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val accountService: AccountService) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers(HttpMethod.GET, "/login.html").permitAll()
                auth.requestMatchers(HttpMethod.POST, "/api/accounts").permitAll()
                auth.anyRequest().authenticated()
            }
            .httpBasic(Customizer.withDefaults())
            .logout { logout ->
                logout.permitAll()
            }
            .build()
    }

    @Bean
    fun userDetailsService() = UserDetailsService { username ->
        val user = accountService.getByUsername(username)
            ?: throw UsernameNotFoundException("User not found")

        User.builder()
            .username(user.username)
            .password(passwordEncoder().encode(user.password))
            .roles("USER")
            .build()
    }


    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
