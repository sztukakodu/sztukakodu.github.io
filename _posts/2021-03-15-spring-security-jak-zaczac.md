---
layout:	video
title: Spring Security - jak zacząć? Jak dodać do projektu?
description: Zabezpieczenie aplikacji przed nieuprawnionym dostępem to jedna z najważniejszych rzeczy do zrobienia przed wypuszczeniem programu do klientów. Nie możemy sobie pozwolić na to, by dowolny użytkownik aplikacji miał dostęp do wszystkich danych i funkcji systemu. Na szczęście w Springu możemy łatwo o to zadbać z pomocą projektu Spring Security, a w tym wpisie pokażę Ci jak to zrobić :)
image: /images/1500x1000.png
tags: [spring, security]
video: y9YIfFQWIwk
---

Aby dodać Spring Security do projektu w Spring Boocie będziemy potrzebować trzech składników:

1. odpowiednie zależności w projekcie,
2. konfiguracja endpointów,
3. konfiguracja użytkowników.


## Dodanie zależności

Tutaj sprawa jest prosta. Wystarczy dodać odpowiedni starter do zależności (tu przykład w Mavenie i pliku `pom.xml`) i voila - Security mamy dodane do projektu.

```xml
<dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

## Konfiguracja endpointów

W tym momencie cała Twoja aplikacja jest zabezpieczona przed nieuprawnionym dostępem, a jedyny sposób by się do niej dostać to skorzystanie z uwierzytelnienia Basic Auth i dwóch parametrów:

1. nazwa użytkownika - domyślnie `user`
2. hasło - wygenerowane na Twojej konsoli w formacie UUID, np. `63474724-1ceb-4a7d-bc0e-119fd728a915`
	* szukaj wpisu `Using generated security password: 63474724-1ceb-4a7d-bc0e-119fd728a915`


Co jeśli nie chcesz, aby wszystko było zabezpieczone?

W tym celu musisz nadpisać klasę `WebSecurityConfigurerAdapter`, dodać ją do kontekstu Springa (np. adnotacją `@Configuration`) i zdefiniować własne reguły autoryzacji.

```java
@Configuration
class BookaroSecurityConfiguration extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .authorizeRequests()
      .mvcMatchers(HttpMethod.GET, "/catalog/**").permitAll()
      .anyRequest().authenticated()
    .and()
      .httpBasic();
  }
}
```

Powyższy fragment oznacza:

* requesty GET pod adres `/catalog` i jego podścieżki mają być dostępne dla wszystkich użytkowników - `mvcMatchers(HttpMethod.GET, "/catalog/**").permitAll()`
* pozostałe żądania - `anyRequest().authenticated()` wymagają bycia uwierzytelnionym
* dodatkowo pozwalamy na dostęp za pomocą Basic Auth - `.and().httpBasic()`

Gotowe. Teraz możesz sprawdzić, że nie wszystkie endpointy wymagają autoryzacji w Twojej aplikacji.

## Konfiguracja użytkowników

Użytkowników można konfigurować na trzy sposoby:

1. w pamięci aplikacji,
2. w bazie danych aplikacji,
3. z zewnętrznych dostawców.

W tym artykule skupimy się na pierwszym sposobie.

Aby skonfigurować użytkowników w pamięci wracamy do klasy konfiguracyjnej `BookaroSecurityConfiguration` i nadpisujemy kolejną metodę.

```java
@Configuration
class BookaroSecurityConfiguration extends WebSecurityConfigurerAdapter {
  // ...
  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.inMemoryAuthentication()
      .withUser("marek@example.org")
      .password("{noop}xxx")
      .roles("USER")
    .and()
      .withUser("admin")
      .password("{noop}xxx")
      .roles("ADMIN");
  }
}	    
```

Za pomocą obiektu `AuthenticationManagerBuilder` możemy zdefiniować jakich użytkowników z jakimi rolami chcemy mieć w swoim systemie.

W tym wypadku dodaję dwóch użytkowników:

* `marek@example.org` z hasłem `xxx` i rolą `USER`,
* `admin ` z hasłem `xxx` i rolą `ADMIN`.

Zapis `.password("{noop}xxx")` oznacza, że nie chcę korzystać z żadnego (noop => no-operation) algorytmu szyfrującego hasła. Stąd przy próbie dostępu do endpointów w Basic Auth będę przekazywał właśnie `xxx` jako hasło.

## Zabezpieczanie po roli

Skoro mamy już użytkowników z konkretnymi rolami, to możemy je wykorzystać do zabezpieczenia dostępu do konkretnych endpointów w aplikacji. Możemy to osiągnąć korzystając z adnotacji `@Secured`.

```java
@RestController
@RequestMapping("/admin")
class AdminController {

  @Secured("ROLE_ADMIN")
  @PostMapping("/data")
  public void initialize() {
    // ...
  }
}
```

```java
@RestController
@RequestMapping("/orders")
class OrdersController {

  @Secured({"ROLE_ADMIN", "ROLE_USER"})
  @GetMapping
  public ResponseEntity<Order> getOrders() {
    // ...
  }
}
```

Do endpointu `/admin` będzie miał dostęp tylko administrator, a do endpointu `/orders` zarówno administrator jak i zwykły, uwierzytelniony użytkownik. Osoba anonimowa nie będzie mogła uzyskać odpowiedzi z systemu.

Aby adnotacja `@Secured` zadziałała, potrzeba ją explicite włączyć w naszej aplikacji za pomocą `@EnableGlobalMethodSecurity(securedEnabled = true)`.

```java
@Configuration
@EnableGlobalMethodSecurity(securedEnabled = true)
class BookaroSecurityConfiguration extends WebSecurityConfigurerAdapter {

}
```

## Gotowe!

Twoja aplikacja jest zabezpieczona, wybrane endpointy są schowane za Security, konta zdefiniowane i odpowiednie role przypisane do odpowiednich operacji w aplikacji. W tej chwili dostęp do systemu jest o wiele lepiej chroniony niż wcześniej.

