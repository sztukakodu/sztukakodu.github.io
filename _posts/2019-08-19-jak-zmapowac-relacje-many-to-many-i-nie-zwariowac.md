---
layout: post
title: Jak zmapować relację Many to Many i nie zwariować?
description: 
image: /images/relacje.png
tags: [spring, hibernate, relacje]
---

Po raz kolejny próba zmapowania relacji Wiele do Wielu (ang. Many to Many) w Hibernate doprowadza Cię do frustracji? Znam to uczucie. Zapraszam Cię do przewodnika, dzięki któremu to już nigdy nie będzie dla Ciebie problemem. 

## 1. Czym jest relacja wiele do wielu?
Wiąże ona dwa zbiory, których elementy mogą łączyć się ze sobą w wielokrotnej liczbie. Ok, a tak po ludzku?
Przykładowo grupy zainteresowań na studiach, wpisy na blogu i tagi, autorzy i książki.

Każda z tych par może występować w wielu konfiguracjach:

* do wielu grup studenckich, może należeć wiele osób,
* do wielu wpisów na blogu, może być przypisanych wiele tagów,
* wiele książek może być napisanych przez wielu autorów.

Jak więc zmapować taką relację za pomocą Hibernate? Już tłumaczę ;)

> Kod źródłowy do przykładów z tego wpisu znajdziesz na: [https://github.com/darek1024/sk-many-to-many](https://github.com/darek1024/sk-many-to-many)

## 2. Adnotacja i już!
Spójrzmy na przykład grup zainteresowań i studentów.

```java
@Entity(name = "students")
public class Student {

    @Id
    private Long id;
    private String name;

    @ManyToMany
    private Set<Group> groups = new HashSet<>();
}
```

```java
@Entity(name = "groups")
public class Group {
    @Id
    private Long id;
    private String name;

    @ManyToMany
    private Set<Student> students = new HashSet<>();
```

W obu klasach definiujemy relację za pomocą adnotacji `@ManyToMany`. Za pomocą typów `Group` i `Student` Hibernate sam będzie wiedział, jak tę relację utworzyć. 

Ile więc będziemy mieć tabel w bazie danych po uruchomieniu takiej aplikacji? Jedną dla grup zainteresowań, jedną dla studentów i jedną mapującą studentów do grup. 

Zobaczmy.

![mtm](/images/manytomany1.png)

*(Lista tabel w relacji Many to Many wygenerowana przez Hibernate)*

Ciekawe, prawda? Hibernate wygenerował mapowanie wiele do wielu **dwustronnie**. Zarówno od grup jak i od studentów. W rezultacie zamiast jednej tabeli łącznikowej, mamy dwie: `groups_students` i `students_groups`.

Aby to naprawić, musimy być bardziej dokładni w określaniu mapowania.

## 3. @JoinTable
W tym celu musimy skorzystać z adnotacji `@JoinTable`, w której opiszemy jak powinna zostać zmapowana relacja.

Możemy ją zdefiniować po dowolnej stronie relacji - na klasie `Student` lub na klasie `Group`. Ja w tym przykładzie określę ją po stronie studentów.

```java
@Entity(name = "students")
public class Student {

    @Id
    private Long id;
    private String name;

    @ManyToMany
    @JoinTable(
        name = "users_groups",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private Set<Group> groups = new HashSet<>();
```

W `JoinTable` określamy wartości:

* `name` - nazwa tabeli, w której będzie trzymane mapowanie identyfikatorów z obu tabel,
* `joinColumns` - lista kolumn które będą identyfikować naszą stronę relacji - studentów,
* `inverseJoinColumns` - lista kolumn, które będą identyfikować drugą stronę relacji - listę grup.

Dodatkowo w encji `Group` musimy zdefiniować, że relacja *Many to Many* jest określona w encji Studentów. 
Robimy to za pomocą `@ManyToMany(mappedBy = "groups")`, wskazując nazwę pola w encji `Student`.

```java
@Entity(name = "groups")
public class Group {

    @Id
    private Long id;
    private String name;

    @ManyToMany(mappedBy = "groups")
    private Set<Student> students = new HashSet<>();
}
```


Tym razem po uruchomieniu aplikacji, nasza struktura powinna już wyglądać o wiele lepiej.

![mtm2](/images/manytomany2.png)

*(Relacja Many to Many w bazie danych po użyciu adnotacji @JoinTable)*

## 4. Cascade
Kolejne ważne ustawienie relacji to kaskadowość operacji. Czyli co ma się dziać z encjami zapisywanymi razem. 

Dostępne są następujące opcje:

* `CascadeType.ALL`
* `CascadeType.PERSIST`
* `CascadeType.MERGE`
* `CascadeType.REMOVE`
* `CascadeType.REFRESH`
* `CascadeType.DETACH`

Jeśli nie określimy tego ustawienia, wówczas będziemy musieli ręcznie zapisywać każdą encję zanim zbudujemy relacje.

Wtedy nasz kod wyglądałby tak:

1. Stworzenie encji `Student` i zapisanie do bazy danych
2. Stworzenie encji `Group` i zapisanie do bazy danych
3. Dodanie `Group` do `Student` i zapisanie do bazy danych.
4. Dodanie `Student` do `Group` i zapisanie do bazy danych.

Strasznie dużo kroków. Zamiast tego z pomocą `CascadeType.ALL` możemy to skrócić do:

1. Stworzenie encji `Student`.
2. Stworzenie encji `Group`.
3. Dodanie `Group` do `Student`.
4. Dodanie `Student` do `Group`.
5. Zapisanie Student do bazy danych.

W efekcie wykonujemy jedno polecenie, które za nas umieszcza wszystkie obiekty w bazie danych.

**ALE UWAGA**. Kaskadowe zarządzanie obiektami może odbić się czkawką w związku z problemami wydajnościowymi (na przykład przy usuwaniu obiektów) lub poprawności danych. Na przykład usuwając jednego studenta, możemy przez przypadek usunąć wszystkie grupy, do których należy! Nawet jeśli nadal są tam inni studenci.

Dlatego zamiast korzystać z `CascadeType.ALL` zaleca się korzystać jedynie z dwóch atrybutów, to jest `CascadeType.MERGE` i `CascadeType.PERSIST`, które stworzą lub zaktualizują nasze obiekty.

W przypadku chęci usuwania obiektów, musimy robić to ręcznie. 

Atrybut `cascade`, tak jak wcześniej, definiujemy tylko po jednej stronie relacji.

```java
@Entity(name = "students")
public class Student {

    @Id
    private Long id;
    private String name;

    @ManyToMany(
        cascade = {CascadeType.MERGE, CascadeType.PERSIST}
    )
    @JoinTable(
        name = "users_groups",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private Set<Group> groups = new HashSet<>();
}
```

## 5. Dodawanie obiektów do relacji

Jak być może zauważyłeś w powyższym akapicie, dodawanie obiektów do relacji *Many to Many* jest trochę uciążliwe. Trzeba umieścić zarówno grupę w studencie jak i studenta w grupie. 

W kodzie może wyglądać to tak.

```java

// 1. Stworzenie encji student i group
Student student = new Student(1L, "Mariusz");
Group group = new Group(1L, "Spring Polska");

// 2. Stworzenie kolekcji group, dodanie grupy 
// i zapisanie kolekcji do encji student (!)
Set<Group> groups = new HashSet<>();
groups.add(group);
student.setGroups(groups);

// 3. To samo z drugiej strony - dodanie studenta do grupy
Set<Student> students = new HashSet<>();
students.add(student);
group.setStudents(students);

// 4. Zapisanie obiektu studenta do bazy danych
// (Dzięki cascade grupa też się zapisze)
studentsRepository.save(student);
```

Przyznasz, że nie wygląda to zachęcająco.

Dlatego, oprócz wyżej wymienionych elementów musimy zadbać o jeszcze jeden. Zdefiniowanie metod do łatwego dodawania obiektów relacji.

W encji `Student` musimy dodać dwie metody: `addGroup` i `removeGroup`.

```java
@Entity(name = "students")
public class Student {

    @Id
    private Long id;
    private String name;

    @ManyToMany(
        cascade = {CascadeType.MERGE, CascadeType.PERSIST}
    )
    @JoinTable(
        name = "users_groups",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private Set<Group> groups = new HashSet<>();

    public void addGroup(Group group) {
        this.groups.add(group);
        group.getStudents().add(this);
    }

    public void removeGroup(Group group) {
        this.groups.remove(group);
        group.getStudents().remove(this);
    }
}
```

W obu tych metodach dodajemy obiekty po obu stronach relacji. Grupę do studenta i studenta do grupy. Analogicznie operacji wykonujemy podczas usuwania relacji między obiektami.

Trochę to wszystko karkołomne. Ale na końcu efekt jest wart wysiłku i teraz zdefiniowanie relacji między obiektami jest o wiele wygodniejsze.

```java
// 1. Stworzenie encji student i group
Student student = new Student(1L, "Mariusz");
Group group = new Group(1L, "Spring Polska");

// 2. Dodanie grupy do studenta 
// (i w drugą stronę w ciele metody)
student.addGroup(group);

// 3. Zapisanie student do bazy danych
// (i automatycznie grupy)
studentsRepository.save(student);
```

Nie prawda, że o niebo lepiej?

## Podsumowanie
Zarządzanie relacjami *Many to Many* w Hibernate to ciężki kawałek chleba ;) Wcześnie włożony wysiłek jednak się opłaca i zarządzanie encjami powinno być już łatwiejsze.

Z tego wpisu dowiedziałeś się kluczowych informacji na temat tego jak takie relacje zbudować i na co szczególnie zwrócić uwagę.

Masz więcej pytań? Daj znać w komentarzu!
