---
layout:	post
title: Jak pogrupować Stringi według długości za pomocą Stream API?
description: Odpowiedź na pytanie z cyklu pytań rekrutacyjnych :)
image: /images/1500x1000.png
tags: [stream, java, string, rekrutacja]
---



```java
List<String> words = List.of("apple", "banana", "cherry", "date", "elderberry", "fig", "grape");
Map<Integer, List<String>> groupedWords = words.stream()
    .collect(Collectors.groupingBy(String::length));
```

```java
{
	3:	["fig"],
	4:	["date"],
	5:	["apple", "grape"],
	6:	["banana", "cherry"],
	10:	["elderberry"]
}
```


```java
Map<Integer, Set<String>> groupedWords = words.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.mapping(s -> s.toUpperCase(), Collectors.toSet())));
```

## Jak wykorzystać do tego współbieżność?

Wystarczy, że zamiast zwykłego strumienia utworzysz strumień współbieżny - metodą `Collection#parallelStream()`:

```java
Map<Integer, List<String>> groupedWords = words.parallelStream()
    .collect(Collectors.groupingBy(String::length));
```

lub `Stream#parallel()` 

```java
Map<Integer, List<String>> groupedWords = words.stream().parallel()
    .collect(Collectors.groupingBy(String::length));
```

> Pamiętaj, że ta operacja wykona się na współdzielonej puli wątków - `ForkJoinPool`.


## Jak wykorzystać do tego standardowe API?

```java
public Map<Integer, List<String>> groupByLength(List<String> words) {
    Map<Integer, List<String>> groups = new ConcurrentHashMap<>();
    words.forEach(word -> {
        groups.compute(word.length(), (integer, list) -> {
            List<String> newList = list != null ? list : new ArrayList<>();
            newList.add(word);
            return newList;
        });
    });
    return groups;
}

groupByLength("apple", "banana", "cherry", "date", "elderberry", "fig", "grape")
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
