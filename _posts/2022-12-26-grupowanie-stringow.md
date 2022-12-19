---
layout:	post
title: Jak pogrupować Stringi według długości za pomocą Stream API?
description: Odpowiedź na pytanie z cyklu pytań rekrutacyjnych :)
image: /images/grupowanie-stringow.png
tags: [stream, java, string, rekrutacja, wspolbieznosc]
---

Podczas rozmowy o pracę możesz zostać spytany o sposób na pewne proste operacje do wykonania na obiektach w Javie.

Przykładem takiego pytania może być prośba o wydajne pogrupowanie Stringów według ich długości.

## Jak mogła by wyglądać taka implementacja?

Najprościej skorzystać z API do Strumieni - `Stream API`.

Wystarczy wejściową kolekcję Stringów zamienić na strumień i skorzystać z dedytkowanego *collectora* w metodzie `collect`.

```java
Collectors#groupingBy(Function<? super T,? extends K> classifier)
```

W nim możemy przekazać za pomocą jakiej funkcji chcemy pogrupować nasze obiekty.

Jeśli ma to być **długość Stringa** to wystarczy nam metoda `String#length`.

Całość mogłaby wyglądać jak na fragmencie poniżej.

```java
List<String> words = List.of("apple", "banana", "cherry", "date", "elderberry", "fig", "grape");
Map<Integer, List<String>> groupedWords = words.stream()
    .collect(Collectors.groupingBy(String::length));
```

A wynik działania jest następujący.

```java
{
	3:	["fig"],
	4:	["date"],
	5:	["apple", "grape"],
	6:	["banana", "cherry"],
	10:	["elderberry"]
}
```

## Jak policzyć liczbę elementów w grupie?

W tym celu należy użyć przeciążenia metody `groupingBy` przyjmującej drugi argument `Collector<? super T,A,D> downstream`.

```java
Collector#groupingBy(Function<? super T,? extends K> classifier, Collector<? super T,A,D> downstream)
```

Aby policzyć liczbę elementów trafiających do jednej grupy potrzebujemy więc zastosować `Collectors.counting()`.

Tak wygląda to w całości.

```java
List<String> words = List.of("apple", "banana", "cherry", "date", "elderberry", "fig", "grape");
Map<Integer, Set<String>> groupedWords = words.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting());
```

A wynik powinien być następujący.

```java
{
	3:	1,
	4:	1,
	5:	2,
	6:	2,
	10:	1
}
```

## Jak wykorzystać do tego współbieżność?

Wystarczy, że zamiast zwykłego strumienia utworzysz strumień współbieżny - metodą `Collection#parallelStream()`:

```java
Map<Integer, List<String>> groupedWords = words.parallelStream()
    .collect(Collectors.groupingBy(String::length));
```

Lub `Stream#parallel()`.

```java
Map<Integer, List<String>> groupedWords = words.stream().parallel()
    .collect(Collectors.groupingBy(String::length));
```

> Pamiętaj, że ta operacja wykona się na współdzielonej puli wątków - `ForkJoinPool`.


## Jak wykorzystać do tego standardowe API Javy?

Możemy pokusić się o samodzielną implementację.

Przykładowa mogłaby wyglądać jak na fragmencie poniżej.

```java
public Map<Integer, List<String>> groupByLength(List<String> words) {
    Map<Integer, List<String>> groups = new HashMap<>();
    words.forEach(word -> {
        groups.compute(word.length(), (integer, list) -> {
            List<String> newList = list != null ? list : new ArrayList<>();
            newList.add(word);
            return newList;
        });
    });
    return groups;
}

var groups = groupByLength("apple", "banana", "cherry", "date", "elderberry", "fig", "grape")
```

I ponownie otrzymany wynik to:

```java
{
	3:	["fig"],
	4:	["date"],
	5:	["apple", "grape"],
	6:	["banana", "cherry"],
	10:	["elderberry"]
}
```

## Podsumowanie

Najprostszym sposobem grupowania elementów w Javie jest skorzystanie z API strumieni, obiektu `Collector` i jego wbudowanej statycznej metody `groupingBy`.

Jeśli chcesz możesz skorzystać z przetwarzania współbieżnego, a także zdefiniować efekt końcowy grupowania - na przykład zliczenie ile obiektów trafia do tej samej grupy.
