---
layout: post
title:  Lazy Initialization Exception. Jak sobie z nim radzić? (Spring & Hibernate)
description: Jeśli pracujesz na co dzień z Javą i Hibernatem, są duże szanse, że Twój program zgłosił Ci wyjątek LazyInitializaitonException. Z czego on wynika i jak sobie z nim poradzić?
date:   2022-03-13 13:24:35 +0200
image:  /images/fine.jpg
tags:   [spring, java, hibernate, jpa]
---

Jeśli pracujesz na co dzień z Javą i Hibernatem, są duże szanse, że Twój program zgłosił Ci wyjątek **LazyInitializaitonException**.

Z czego on wynika i jak sobie z nim poradzić?

## Najpierw przygotujmy sobie fragment kodu, w którym zpreprodukujemy dany przypadek.

Mamy dwie encje - `Comment` i `Blogpost`.

```java
@Entity
public class Comment {
    @Id
    @GeneratedValue
    private Long id;
    private String author;
    private String content;
}
```

```java
@Entity
public class Blogpost {
    @Id
    private Long id;
    private String title;
    private String content;

    @OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinColumn(name = "post_id")
    private Set<Comment> comments;
}
```

Jak widać, jest między nimi prosta relacja - **OneToMany**.

Jeden wpis na blogu może mieć wiele komentarzy.

Przygotujmy sobie teraz proste repozytorium do pobierania blogpostów.

```java
public interface BlogpostRepository extends JpaRepository<Blogpost, Long> {
}
```

I napiszmy prosty test.

1. Tworzymy zbiór komentarzy - z jednym komentarzem.
2. Oraz jedną książkę - do której przypisujemy ten komentarz.
3. W teście pobieramy samą książkę, a potem próbujemy zliczyć liczbę wszystkich komentarzy.
4. W efekcie dostajemy **LazyInitializationException** 👻

```java
@SpringBootTest
class BlogpostTest {

    @Autowired
    BlogpostRepository repository;

    @BeforeEach
    public void setup() {
        Set<Comment> comments = Set.of(
            new Comment(1L, "Frodo Baggins", "One To Rule Them All!")
        );
        Blogpost blogpost = new Blogpost(1L, "Atlas Shrugged", "Who is John Galt?", comments);
        repository.save(blogpost);
    }

    @Test
    void throwsLazyInitException() {
        // when
        Blogpost blogpost = repository.getById(1L);

        // then
        assertThrows(
            LazyInitializationException.class,
            () -> blogpost.getComments().size()
        );
    }
}
```

> Po uruchomieniu tego testu zobaczymy zielony napis: TESTS PASSED ✅

## Ok. A z czego to wynika?

Relacja między `Blogpost` a `Comment` sprawia, że przy pobieraniu wpisu, komentarze pobierane są w sposób **Lazy**.

Oznacza to, że jeśli nie wskażemy wprost, Hibernate nie zaciągnie tych dodatkowych wierszych do pamięci naszej aplikacji.

Wynika to z optymalizacji, które Hibernate próbuje dla nas zrobić.

Oraz z domyślnej wartości parametru `fetchType` w adnotacji `@OneToMany`.

Sesja Hibernatowa (otwarte połączenie do bazy danych) jest tutaj krótkotrwała i odbywa się tylko w momencie zawołania kodu: `Blogpost blogpost = repository.getById(1L)`.

Potem sesja (połączenie do bazy danych) jest zamykane i w momencie, gdy próbujemy pobrać komentarze do wpisu: `blogpost.getComments().size()` Hibernate nie ma już połączenia z bazą danych i informuje nas o tym wyjątkiem **LazyInitializaitonException**.

## Jak to w takim razie naprawić?

Rozwiązań jest kilka.

Przyjrzyjmy się im po kolei.

### Rozwiązanie 1 - Założenie transakcji.

```java
@Test
@Transactional
void fetchesBlogpostWithCommentsInTransaction() {
    // when
    Blogpost blogpost = repository.getById(1L);

    // then
    assertEquals(1, blogpost.getComments().size());
}
```

Najprostszy sposób. Przez zastosowanie adnotacji `@Transactional` instruujemy Hibernate-a by przez całą metodę testową miał otwartą sesję do bazy danych.

Dzięki temu w momencie zawołania `blogpost.getComments().size()` wykonywane są pod spodem kolejne zapytania SQL, które dociągają brakujące komentarze do naszej aplikacji.

### Rozwiązanie 2 - Join Fetch

Minusem poprzedniego rozwiązania jest generowanie tak zwanego **problemu N + 1**.

Między aplikacją a bazą danych wykonywanych jest zbyt wiele zapytań.

Rozwiązaniem może być skorzystanie z polecenia `JOIN FETCH`.

```java
public interface BlogpostRepository extends JpaRepository<Blogpost, Long> {
    @Query("SELECT b FROM Blogpost b JOIN FETCH b.comments WHERE b.id = :id")
    Blogpost getByIdWithComments(@Param("id") Long id);
}
```

W tym wypadku musimy zdefiniować dodatkowo zapytanie w `BlogpostRepository`, w którym definiujemy wprost, że chcemy by zależne encje były również od razu pobrane z bazy danych.

```java
@Test
void fetchesBlogpostWithCommentsInSingleCall() {
    // when
    Blogpost blogpost = repository.getByIdWithComments(1L);

    // then
    assertEquals(1, blogpost.getComments().size());
}
```

Test ponownie przechodzi, a my znacznie zredukowaliśmy liczbę zapytań do bazy.

### Rozwiązanie 3 - Entity Graph

Alternatywnym sposobem jest skorzystanie z konstrukcji `@EntityGraph`.
Tak jak widać na poniższym fragmencie kodu.

```java
public interface BlogpostRepository extends JpaRepository<Blogpost, Long> {
    @EntityGraph(attributePaths = {"comments"})
    Blogpost getBlogpostGraphById(Long id);
}
```

Efekt będzie podobny jak w **JOIN FETCH**, a nasz test ponownie będzie zielony.

```java
@Test
void fetchesBlogpostWithCommentsGraph() {
    // when
    Blogpost blogpost = repository.getBlogpostGraphById(1L);

    // then
    assertEquals(1, blogpost.getComments().size());
}
```

### Rozwiązanie 4 - Named Entity Graph

Możemy też skorzystać z konstrukcji **Named Entity Graphs**.

W tym przypadku definiujemy **nazwany graf encji** w definicji klasy i wskazujemy wprost, jakie dodatkowe relacje chcemy pobrać `attributeNodes = { @NamedAttributeNode("comments") }`.

Nazwany graf encji `@NamedEntityGraph(name = "Blogpost.comments")` wykorzystamy potem w `JpaRepository`.

```java
@Entity
@NamedEntityGraph(
    name = "Blogpost.comments",
    attributeNodes = { @NamedAttributeNode("comments") }
)
public class Blogpost {
    @Id
    private Long id;
    private String title;
    private String content;

    @OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinColumn(name = "post_id")
    private Set<Comment> comments;
}
```

```java
public interface BlogpostRepository extends JpaRepository<Blogpost, Long> {
    @EntityGraph("Blogpost.comments")
    Blogpost getBlogpostNamedGraphById(Long id);
}
```

I tak jak poprzednio, test przechodzi na zielono.

```java
@Test
void fetchesBlogpostWithCommentsNamedGraph() {
    // when
    Blogpost blogpost = repository.getBlogpostNamedGraphById(1L);

    // then
    assertEquals(1, blogpost.getComments().size());
}
```

### Rozwiązanie 5 - FetchType.EAGER (raczej! tego nie rób)

Ostatnie, ale najmniej zalecane rozwiązanie.

Zmiana sposobu pobierania encji z **Lazy** na **Eager**: `@OneToMany(..., fetch = FetchType.EAGER)`.

```java
@Entity
public class Blogpost {
    @Id
    private Long id;
    private String title;
    private String content;

    @OneToMany(
        cascade = {CascadeType.MERGE, CascadeType.PERSIST},
        fetch = FetchType.EAGER
    )
    @JoinColumn(name = "post_id")
    private Set<Comment> comments;
}
```

W tym przypadku komentarze zawsze będą pobierane, gdy będziemy z bazy pobierać też wpisy na bloga.


```java
@Test
void fetchesCommentsEagerly() {
    // when
    Blogpost blogpost = repository.findById(1L).get();

    // then
    assertEquals(1, blogpost.getComments().size());
}
```

Sprawi to, że test będzie zielony.

Ale wydajnościowo może sprawić nam problemy.

W końcu nie zawsze będziemy chcieli pobierać razem z wpisami ich wszystkie komentarze.

W przypadku skorzystania z tej opcji, nie mamy możliwości wybory czy chcemy czy nie pobrać komentarze.

W poprzednich rozwiązaniach, to my decydujemy, kiedy będziemy dodatkowe encje z bazy danych wyciągać.


## W porządku. To z czego to wszystko wynika?

1. Źródłem problemu jest tzw. lazy-loading.
2. Optymalizacja, którą stosuje Hibernate przy zapewnić wysoką wydajność Twojej aplikacji.
3. Niestety bez znajomości tego mechanizmu, działanie Twojej aplikacji - jak w zaprezentowanym u góry przykładzie - może być dla Ciebie zaskakujące.

Dlatego przy relacjach OneToMany, ManyToOne i ManyToMany upewnij się, że w odpowiedni sposób rozwiązujesz kwestię relacji.