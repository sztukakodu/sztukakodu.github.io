---
layout: post
title: HashMap vs ConcurrentHashMap - Czym Się Różnią?
description: 
image: /images/concurrentmap.png
tags: [hashmap, concurrenthashmap, java, wspolbieznosc]
---

Mapa to jedna z najczęściej używanych kolekcji przez programistów Javy. Za każdym razem, kiedy potrzebujemy odczytywać obiekty za pomocą klucza, korzystamy z tego właśnie typu. Ale czy na pewno dobrze to robimy? Czy używamy odpowiedniej implementacji?

Najpopularniejsza implementacja mapy, którą spotyka się na co dzień to HashMapa. Dzięki zastosowaniu funkcji hashującej, która oblicza, gdzie w strukturze HashMapy powinien znaleźć się nasz obiekt, otrzymujemy bardzo dobrą wydajność takiej kolekcji.

Nie każdy jednak wie, że na HashMapę należy uważać.

O ile daje nam ona dobrą wydajność, o tyle nie zapewnia żadnych gwarancji w kontekście wielowątkowości!

## No i co z tego?

A no to, że korzystając ze zwykłej HashMapy, możesz bardzo prosto doprowadzić do błędnego przetwarzania swoich danych.

Zapisy i odczyty do mapy nie są synchronizowane, więc może się okazać, że po współbieżnym dostępie, dane w mapie będą niepoprawne.

Dla przykładu spójrzmy na poniższy kod.


```java
public static void main(String[] args) throws InterruptedException {
    Map<Integer, Integer> visits = new HashMap<>();  // 1
    ExecutorService executors = Executors.newFixedThreadPool(10);  // 2
    for (int i = 0; i < 100; ++i) {  // 3
        final int key = i % 10;      // 3.2
        executors.execute(() -> {
            for (int j = 0; j < 100; ++j) {   // 3.1
                visits.compute(key, (k, value) -> (value == null ? 0 : value) + 1);
            }
        });
    }
    executors.shutdown();  // 4
    executors.awaitTermination(10, TimeUnit.MINUTES);  // 5
    int totalSum = visits.values().stream().mapToInt(x -> x).sum();  // 6
    System.out.println("Total sum is: " + totalSum);
}
```

Jego logika jest następująca.

1. Stwórz instancję HashMapy
2. Przygotuj pulę wątków z 10 wątkami.
3. W pętli uruchom 100 zadań, które 100 razy (3.1) będą zwiększać licznik w mapie o 1. Korzystamy z kluczy mapy z zakresu 0-9 (3.2).
4. Wyślij sygnał zamknięcia puli wątków.
5. Zaczekaj na zamknięcie.
6. Oblicz sumę wszystkich wartości.

Wynik, który powinniśmy otrzymać to 100 * 100, czyli 10.000  (100 razy uruchamiamy zadania, które 100 razy inkrementują liczniki w mapie).

Ale to, co zobaczysz, będzie raczej przypominać poniższy rezultat.

```
Total sum is: 9743
Total sum is: 10000
Total sum is: 9999
Total sum is: 8959
```

## Hmm, faktycznie 🤔

Jakie jest rozwiązanie? Prostsze niż myślisz!

(I nie, nie chodzi o nałożenie bloku `synchronized` ... ;) )

Wystarczy, że zamienisz HashMapę na `ConcurrentHashMapę`.

```java
Map<Integer, Integer> visits = new ConcurrentHashMap<>();
```

I voila! Kolejne uruchomienia aplikacji będą powodować następujące wyniki

```
Total sum is: 10000
Total sum is: 10000
Total sum is: 10000
Total sum is: 10000
...
```


## Dlaczego tak się stało?
`ConcurrentHashMapa` utrzymuje wewnątrz siebie mechanizm *lockowania* na poziomie pojedynczych kluczy. Za każdym razem kiedy odnosisz się jednocześnie do tych samych kluczy w mapie, mechanizm synchronizacji sprawia, że jeden wątek musi zaczekać na drugi.

Z jednej strony otrzymujemy gwarancję spójności, a z drugiej minimalnie wpływamy na wydajność operacji na takiej mapie.

## Na co uważać?

Powyższy przykład zadziałał z tego powodu, że korzystamy z dedykowanej metody `compute`. Alternatywne rozwiązanie, które mógłbyś zobaczyć, mogłoby wyglądać tak.

```java
public static void main(String[] args) throws InterruptedException {
    Map<Integer, Integer> visits = new ConcurrentHashMap<>(); 
    ExecutorService executors = Executors.newFixedThreadPool(10); 
    for (int i = 0; i < 10; ++i) {  
        final int key = i % 10;
        executors.execute(() -> {
            for (int j = 0; j < 100; ++j) {  
                // TEGO NIE RÓB (!)
                int currentValue = visits.get(key);
                visits.put(key, currentValue + 1);
            }
        });
    }
    executors.shutdown();  
    executors.awaitTermination(10, TimeUnit.MINUTES); 
    int totalSum = visits.values().stream().mapToInt(x -> x).sum();  
    System.out.println("Total sum is: " + totalSum);
}
```

W tym wypadku tracimy jakąkolwiek korzyść z korzystania z `ConcurrentHashMapy`. Mimo, że korzystamy z `ConcurrentHashMapy`, to operację odczytania i zmiany wartości robimy w dwóch krokach. Tym samym tracimy jakiekolwiek gwarancje atomowości operacji. Wartość, którą odczytamy z mapy `int currentValue = visits.get(key)`, może być już zupełnie inna w momencie jej ponownego zapisu z powrotem `visits.put(key, currentValue + 1)`.

Zresztą sprawdź sam, uruchamiając powyższy fragment, a otrzymasz podobne wyniki jak w przypadku zwykłej `HashMapy`.


## Co powinienem z tego zapamiętać?
1. W Javie oprócz standardowych kolekcji: `Set`, `Map`, `List` istnieją ich współbieżne odpowiedniki.
2. Dla Mapy najpopularniejszym rozwiązaniem jest `ConcurrentHashMapa`.
3. W środowisku wielowątkowym stosowanie zwykłej `HashMapy` może prowadzić do niepoprawnych danych.
4. Aby wykorzystać gwarancję `ConcurrentHashMapy` warto korzystać z odpowiednich metod do modyfikacji jej zawartości.

