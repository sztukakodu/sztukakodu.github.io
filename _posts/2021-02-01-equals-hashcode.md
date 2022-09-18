---
layout:	post
title: Nigdy nie popełniaj tego błędu mapując ID encji w JPA / Hibernate
description: 
image: /images/uwazaj.jpg
tags: [spring, jpa, hibernate]
---

Czy zdarzyło Ci się podczas pracy z Hibernate wygenerować taką sytuację, w której gubiłeś lub miałeś nadmiarowe encje w aplikacji względem stanu w bazie danych? Powodem mogło być błędne mapowanie identyfikatora encji i implementacja metod `equals` i `hashcode`. Nigdy o tym nie słyszałeś? To lepiej, żebyś zapoznał się z tym wpisem zanim będzie za późno!

Obiekty w Javie rozróżniane są między sobą na podstawie kontraktu `equals` / `hashcode`. Każdy obiekt w Javie posiada domyślną implementację tych metod, ale jeśli chcemy możemy je nadpisać.

Z kolei wiersze bazodanowe opierają się na kluczy głównym (`primary key`). Hibernate pobierając obiekty z bazy danych korzysta właśnie z tego klucza.

Podczas konwersji z wierszy bazodanowych na obiekty Javowe musimy zwrócić szczególną uwagę jak zachowuje się relacja tożsamości w obu tych światach. W tym celu musimy pochylić się nad metodami `equals` i `hashcode`.


### Podejście pierwsze - brak zwrócenia uwagi na implementację equlas / hashcode - ŹLE :(

Wyobraźmy sobie sytuację, w której mamy utworzony jakiś Set lub Mapę, która żyje dłużej w naszej aplikacji niż pojedyncza sesja Hibernate - czyli na przykład pomiędzy dwoma żądaniami HTTP użytkownika.

Wtedy odpytując bazę danych o obiekty, w naszych kolekcjach pojawią się duplikaty.


```java
@Entity
class Book {
	@Id
	private Long id;
	private String title;
	private String author;
	private Long year;

	// getters, setters
}
```

W kolekcji będą znajdować się dwie instancje klasy `Book` odpowiadające jednemu wierszowi w bazie danych. Podczas pobierania ich z bazy, Hibernate stworzy dla nich nowe instancje. 
Stosowanie domyślnej implementacji `equals` i `hashcode` sprawi, że obiekt zostanie po prostu dodanych do zbioru (chociaż jego reprezentacja już się tam znajduje!).

Może się wtedy okazać, że zamiast 100 książek w kolekcji (których się spodziewamy na podstawie bazy danych) będzie ich większa ilość.

Co możemy więc zrobić?


### Podejście drugie - oparcie o atrybuty - TEŻ BEZ SZAŁU :)

Drugie podejście jest takie, że opieramy metody `equals` & `hashcode` na atrybutach danej encji.

Przykładowo - w książce możemy je oprzeć o tytuł, autora czy rok wydania.

```java
@Entity
class Book {
    @Id
    private Long id;
    private String title;
    private String author;
    private Long year;

    // getters, setters
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Book book = (Book) o;
        return Objects.equals(title, book.title) &&
            Objects.equals(author, book.author) &&
            Objects.equals(year, book.year);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), title, author, year);
    }
}
```

Wtedy podczas pobierania encji z bazy danych o takich samych wartościach w kolekcji będziemy mieć tylko jedną instancje. Tytuł, autor i rok będą się zgadzać, więc będzie można nadpisać poprzedni obiekt.

Co w sytuacji, gdy dla tego samego wiersza bazodanowego wartości tych atrybutów się zmienią?

Wówczas ponownie w kolekcji znajdą się dwie instancje. 

To może oprzemy kontrakt o klucz główny, hm?

### Opcja trzecia - oparcie equals / hashcode na kluczu głównym - LEPIEJ!

Jest to zdecydowanie lepsza opcja. Teraz niezależnie od tego, jak będą zmieniać się poszczególne atrybuty encji książką, jeśli tylko jej identyfikator będzie zgodny z tym, który już znamy (z bazy danych), wtedy mamy pewność, że w kolekcji będzie tylko jedna instancja.

```java
@Entity
class Book {
	@Id
    private Long id;
    private String title;
    private String author;
    private Long year;

    // getters, setters
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Book book = (Book) o;
        return Objects.equals(id, book.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id);
    }
}
```

Wszystko byłoby fajnie, gdyby nie kwestia dodawania do kolekcji encji, które jeszcze nie zostały zapisane do bazy danych - a tym samym nie mają jeszcze nadanego przez bazę danych `id`.

Spójrzmy na poniższą sytuacje.

```java
books.put(new Book("Adam Mickiewicz", "Pan Tadeusz", 1834));
books.put(new Book("Juliusz Słowacki", "Kordian", 1834));	
// books ma tylko jedną z książek!
booksRepository.saveAll(books);
```

Obie instancje `Book` mają `null` w polu ID. Tym samym kolekcja `books` będzie zawierać tylko jedną z nich (!).

Co teraz, geniuszu?

### Opcja czwarta - generowanie unikalnego atrybutu w momencie tworzenia encji - NAJLEPIEJ!

Jest na to rozwiązanie!

Polega ono na dodaniu dodatkowego atrybutu do naszych encji. Atrybutu, który będzie generowany w momencie tworzenia nowej instancji, zapisywany razem z encją do bazy danych i na podstawie którego oparty będzie kontrakt `equals` & `hashcode`.

Idealnym przykładem takiego atrybutu jest `UUID`.

```java
books.put(new Book("Adam Mickiewicz", "Pan Tadeusz", 1834));  // uuid=3a4d...
books.put(new Book("Juliusz Słowacki", "Kordian", 1834));  // uuid=ed10...
// books ma obie książki!
booksRepository.saveAll(books);
```

W tym wypadku obie encje Book jeszcze przed zapisaniem do bazy danych mają nadane specjalnie identyfikatory rozróżniające instancje.

Natomiast w momencie czytania encji z bazy danych - wartości pól `uuid` również zostaną odczytane - i w momencie pracy z kolekcją `books` nowe instancje książek zostaną zwyczajnie nadpisane.

W ten sposób liczba obiektów w kolekcji `books` będzie się zgadzać, a my będziemy mieć pewność, że na pewno mówimy o tych samych instancjach.

### Jak to najlepiej zaimplementować?

Oczywiście moglibyśmy do każdej encji dodawać pole `uuid`, ale po co? :)

Wystarczy stworzyć bazową klasę abstrakcyjnę z tym polem i jedynie dziedziczyć po niej.


```java
@MappedSuperclass
@EqualsAndHashCode(of = "uuid")
public abstract class BaseEntity {

    private String uuid = UUID.randomUUID().toString();

    // getter, setter
}

```


> `@EqualsAndHashCode` to adnotacja z Lomboka ułatwiająca implementację `equals` / `hashCode`.


Wtedy wystarczy, że encja `Book` dziedziczy z `BaseEntity`. I nie musi już nawet implementować u siebie metod `equals` / `hashCode`.

```java
@Entity
public class Book extends BaseEntity {
    @Id
    private Long id;
    private String title;
    private String author;
    private Long year;
}
```

### W takim razie po co nam klucz ID?
Bardzo dobre pytanie.

Klucz ID służy do identyfikowania obiektów w bazie danych.
Może świetnie sprawdzać się jako klucz obcy w relacjach między obiektami.
Lub jako klucz zwracany w REST API.

Natomiast pole `uuid` świetnie załatwia nam sprawę tożsamości obiektów i dlatego warto je dodawać do swoich encji.

## Podsumowanie
1. Podczas pracy z JPA / Hibernate wiele rzeczy może pójść nie tak.
2. Jednym z takich elementów jest rozróżnianie tożsamości obiektów.
3. Dlatego warto zwrócić uwagę na to jak implementujemy metody `equals` / `hashcode` w naszych encjach.
4. Najlepszym rozwiązaniem jest zastosowanie klasy abstrakcyjnej z wygenerowanym w aplikacji atrybutem unikalności.
5. Dzięki temu zawsze będziemy mieć pewność czy mówimy o tym samym obiekcie w aplikacji.

