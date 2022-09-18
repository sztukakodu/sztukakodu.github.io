---
layout:	post
title: Prosty sposób na testowanie Thread.sleep w Javie
description: Jeśli korzystasz w swoim kodzie z konstrukcji Thread.sleep, ale zawsze miałeś problem z tym by ją prawidłowo przetestować, ten wpis jest dla Ciebie :).
image: /images/prosty-sposob.jpg
tags: [java, współbieżność, testowanie]
---

Jeśli korzystasz w swoim kodzie z konstrukcji `Thread.sleep`, ale zawsze miałeś problem z tym by ją prawidłowo przetestować, ten wpis jest dla Ciebie :).

Nie raz zdarza się, że potrzebujemy zwolnić wykonywanie naszego kodu.
Nie chcemy by rzeczy działy się od razu, ale by między kolejnymi wykonaniami nastąpił pewien odstęp.

Weźmy za przykład poniższy prosty interfejs.

```java
public interface CurrencyRate {
    BigDecimal rate(String from, String to);
}
```

Załóżmy, że chcemy mieć następującą logikę:

1. metoda `rate` zwraca `null`, gdy nie uda się pobrać wartości,
2. chcemy mieć opcjonalnie mechanizm, który ponawia nam zapytanie o stawkę wymiany w powyższej sytuacji.

W tym celu tworzymy klasę dekorującą `RetriableCurrencyRate`, która ponawia próbę maksymalnie N razy i 
czeka między kolejnymi wywołaniami metody po 1 sekundę przerwy.


```java
public class RetriableCurrencyRate implements CurrencyRate {
    private final CurrencyRate origin;
    private int retriesLimit;

    @Override
    public BigDecimal rate(String from, String to) throws Exception {
        BigDecimal rate = origin.rate(from, to);
        int retries = 0;
        while (rate == null && retries < retriesLimit) {
            Threads.sleep(1_000);
            rate = origin.rate(from, to);
            ++retries;
        }
        return rate;
    }
}
```

Jak mógłby wyglądać prosty test tej klasy? Spójrzmy na `RetriableCurrencyRateTest`.


```java
class RetriableCurrencyRateTest {

    int retriesLimit = 3;

    RetriableCurrencyRate sut = new RetriableCurrencyRate(
        new FailingCurrencyRate(),
        retriesLimit
    );

    @Test
    public void shouldRetry3Times() {
        // when
        BigDecimal rate = sut.rate("usd", "pln");

        // then
        assertNull(rate);
        // and 3 retries - how to test that? :(
    }

}
```

Test jest bardzo prosty, ale ma dwie wady:

1. trwa ponad 3.000 ms - bo 3 razy powtarzamy wywołanie pętli, w której wątek śpi przez 1.000 ms,
2. w sekcji `then` nie jesteśmy w stanie zweryfikować ile faktycznie razy pętla była powtórzona.


## Czy możemy zrobić coś lepiej? Oczywiście!

Co robi dobry programista, gdy nie wie co zrobić? Wprowadza abstrakcję!

Zróbmy podobnie :) 

Zamiast korzystać bezpośrednio z klasy `Thread` i jej metody `sleep`, schowajmy to sobie za dedykowany interfejs `Sleeper`.

```java
public interface Sleeper {
    void sleep(long millis);
}
```

I użyjmy go w naszej klasie w miejsce `Thread.sleep`. :) 


```java
@AllArgsConstructor
public class RetriableCurrencyRate implements CurrencyRate {
    private final CurrencyRate origin;
    private final Sleeper sleeper;
    private int retriesLimit;

    @Override
    @SneakyThrows
    public BigDecimal rate(String from, String to) {
        BigDecimal rate = origin.rate(from, to);
        int retries = 0;
        while (rate == null && retries < retriesLimit) {
            sleeper.sleep(1_000);
            rate = origin.rate(from, to);
            ++retries;
        }
        return rate;
    }
}
```


Jak teraz będzie wyglądał test?

```java
class RetriableCurrencyRateTest {

    int retriesLimit = 3;
    CountingSleeper sleeper = new CountingSleeper(new NoopSleeper());
    RetriableCurrencyRate sut = new RetriableCurrencyRate(
        new FailingCurrencyRate(),
        sleeper,
        retriesLimit
    );

    @Test
    public void shouldRetry3Times() {
        // when
        BigDecimal rate = sut.rate("usd", "pln");

        // then
        assertNull(rate);
        assertEquals(retriesLimit, sleeper.count());
    }

}
```

Ile to trwa? 28ms!

## O stary, ale jak to zrobiłeś?!

Do testu wprowadziłem dedykowane implementacje interfejsu `Sleeper`: `CountingSleeper` oraz `NoopSleeper`.
`CountingSleeper` - to dekorator, który pozwala mi zliczyć ile razy metoda `sleep` została zawołana,
a `NoopSleeper` - to implementacja-wydmuszka - która nic nie robi. 

W sam raz do testów! :)

Dzięki temu, udało się uzyskać, tak krótki czas wykonania kodu.


```java
@RequiredArgsConstructor
public class CountingSleeper implements Sleeper {
    private final Sleeper origin;
    private long count = 0;

    @Override
    public void sleep(long millis) {
        count++;
        origin.sleep(millis);
    }

    public void reset() {
        count = 0;
    }

    public long count() {
        return count;
    }
}

```

```java
public class NoopSleeper implements Sleeper {
    @Override
    public void sleep(long millis) {
        System.out.println("Noop sleep :)");
    }
}

```


## A co w "normalnym" kodzie?

A co zrobić w normalnym = produkcyjnym kodzie.

Po prostu dostarczyć "normalną" implementację. W której skorzystamy ze znanej nam dobrze metody `Thread.sleep`.

```java
public class ThreadSleeper implements Sleeper {
    @Override
    public void sleep(long millis) {
        Thread.sleep(millis);
    }
}
```

## Podsumowanie

W tym wpisie dowiedziałeś się jak sprytnie przetestować `Thread.sleep`, jak można do tego wykorzystać interfejsy w Javie oraz jak w tym wszystkim zastosować wzorzec dekorator.

Daj znać, co myślisz o takim rozwiązaniu i czy stosujesz / planujesz stosować w swoim kodzie :)