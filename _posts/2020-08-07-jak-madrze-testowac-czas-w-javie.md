---
layout: post
title: Jak mądrze testować CZAS w Javie?
description: 
image: /images/czas.png
tags: [testowanie, czas, java]
---

Data utworzenia, data modyfikacji, data wygenerowania. Nasze systemy często potrzebują wstawić takie informacje do obiektów, którymi zarządzają. Ale jak przetestować, że poprawna wartość została wpisana do takich pól? O tym, w poniższym wpisie.

Spójrzmy na fragment kodu.

```java
class InvoiceService {

  Invoice generate(Order order) {
    Invoice invoice = // ...;
    invoice.generatedAt(LocalDateTime.now());
    return invoice;
  }
}
```

Klasa `InvoiceService` ma za zadanie wygenerować fakturę `Invoice` na podstawie zamówienia `Order`.

W trakcie tworzenia do klasy `Invoice` wstawiana jest data wygenerowania faktury `invoice.generatedAt(...)`.

Wszystko wygląda poprawnie. Czas więc by napisać test sprawdzający wpisanie prawidłowej daty. 

```groovy
class InvoiceServiceTest {

  InvoiceService invoiceService = new InvoiceService()

  def "contains date of generation"() {
    given:
      Order order = givenOrder();

    when:
      Invoice invoice = invoiceService.generate(order);
      
    then: 
      invoice.generatedAt == LocalDateTime.now()
  }
}
```

W sekcji `then` porównujemy dwie wartości.

```java
invoice.generatedAt == LocalDateTime.now()
```

Datę wstawioną do faktury `Invoice` z aktualną datą `LocalDateTime.now()`. Na pierwszy rzut wszystko powinno być ok.

Wystarczy jednak, że uruchomisz ten kod na swoim komputerze i zobaczysz, że daty się nie zgadzają. Różnica będzie rzędu milisekund, czy nanosekund.

Nie sposób by data była dokładnie ta sama w momencie generowania faktury `invoiceService.generate(order)`  jak i w chwili weryfikowania testu.

Co więc robi w takiej sytuacji doświadczony programista?

Wprowadza **abstrakcję**!

## Wprowadź Clock i nie martw się czasem :)
Wystarczy, że do naszego kodu dodamy nowy interfejs `Clock` z jedną metodą `time()`.

```java
interface Clock {
  LocalDateTime time();
}
```

Spójrzmy teraz na poniższy fragment kodu zmienionej klasy `InvoiceService`.

```java
class InvoiceService {

  Clock clock;

  Invoice generate(Order order) {
    Invoice invoice = // ...;
    invoice.generatedAt(clock.time());
    return invoice;
  }
}
```

W klasie pojawiło się pole typu `Clock`, które jest używane w momencie wpisywania daty przez metodę `clock.time()`.

```java
invoice.generatedAt(clock.time())
```

Po co to wszystko? A no to po, żeby w trakcie testów mieć pewność, że możemy bezpiecznie sprawdzić wstawioną wartość. Spójrzmy poniżej na zmodyfikowany test.


```groovy
class InvoiceServiceTest {

  Clock clock = new FakeClock()
  InvoiceService invoiceService = new InvoiceService(clock);

  def "contains date of generation"() {
    given:
      Order order = givenOrder();

    when:
      Invoice invoice = invoiceService.generate(order);
      
    then: 
      invoice.generatedAt == clock.time()
  }
}
```

Do testu została wprowadzona "fałszywa" implementacja interfejsu `Clock` o nazwie `FakeClock`. Jest przekazywana do `InvoiceService` w trakcie konstrukcji, a później używana w sekcji `then` przy weryfikacji testu.

```java
invoice.generatedAt == clock.time()
```

I jaki tu zysk? A no taki, że __"fałszywa" implementacja zawsze zwraca tę samą wartość!__ Spójrzmy na jej przykładowy sposób zakodowania.

```java
class FakeClock implements Clock {
  private final LocalDateTime time;

  FakeClock() {
    this.time = LocalDateTime.now();
  }

  LocalDateTime time() {
    return time;
  }
}
```

Zauważ, że czas używany przez `FakeClock` jest ustawiany tylko raz w momencie konstrukcji.

```java
class FakeClock() {
  this.time = LocalDateTime.now();
}
```

Później, każdorazowe zawołanie metody `time()` zwraca zawsze jedną i tę samą instancję zmiennej `time`, a więc zawsze jedną i tę samą wartość.

Dzięki temu zarówno w momencie generowania faktury `Invoice` w trakcie testu jak i w chwili weryfikacji testu pobranie czasu `clock.time()` zwróci te same wartości i test będzie działać poprawnie.

W ten sposób zweryfikujemy, że data została poprawnie wstawiona do klasy `Invoice`. a test nie będzie się "wywalać" z powodu przesunięcia czasu o kilka milisekund.


### A co z klasą Clock dla kodu produkcyjnego?

Tutaj kwestia jest prosta. 

Wystarczy przygotować osobną implementację i dostarczyć ją do systemu (np. poprzez zadeklarowanie `beana` jeśli korzystamy ze [Springa](/spring)).

```java
class SystemClock implements Clock {

  LocalDateTime now() {
    return LocalDateTime.now();
  }
}
```

### Podsumowanie
Teraz już wiesz jak mądrze podejść do testowania atrybutów opartych o czas. Pamiętaj, że za każdym razem kiedy w systemie wołasz ręcznie `new Date()` czy `LocalDateTime.now()` warto zastanowić się, czy w tym miejscu nie powinieneś korzystać z abstrakcji `Clock`.
