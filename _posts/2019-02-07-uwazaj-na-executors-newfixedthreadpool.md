---
layout: post
title: Uważaj na Executors.newFixedThreadPool
description: 
image: https://dummyimage.com/1500x1000/fff/aaa
tags: [współbieżność, pule wątków, wielowątkowość]
---

Czy często zdarza Ci się korzystać z puli wątków wołając kod `Executors.newFixedThreadPool(10)`? Jeśli tak, to uważaj, bo możesz narazić się na duże problemy.Gdy tworzysz pule wątków powyższą metodą fabrykującą, tak naprawdę pod spodem tworzona jest nowa instancja `ThreadPoolExecutor` w następujący sposób:

```java
Executor executor = new ThreadPoolExecutor(
    10, // 1
    10, // 2
    0L, // 3
    TimeUnit.MILLISECONDS, // 4
    new LinkedBlockingQueue<>() // 5
);
```

Co oznaczają poszczególne argumenty?

1. Argument 1 i 2 oznaczają minimalną i maksymalną liczbę wątków, które ma utrzymywać `Executor`. 

Wybraliśmy Executor o stałej liczbie wątków, stąd oba argumenty mają tę samą wartość.

2. Argument 3 i 4 oznaczają jak długo nieużywane wątki mają pracować w trybie `stand-by` oczekując na nowe zadanie. 

Po upływie tego czasu wątek zostaje zatrzymany. 

W naszym przypadku nie ma to znaczenia, gdyż jak poprzednio korzystamy ze stałej liczby wątków.

3. I najważniejszy argument o którym w tym wpisie mowa: `new LinkedBlockingQueue<>()`. 

To właśnie on jest problematycznym argumentem wywołania `Executors.newFixedThreadPool(10)`.
Na czym polega problem? Za każdym razem, gdy wysyłasz nowe zadanie do Executora, nie trafia ono bezpośrednio do wątków do niego przypisanych a ląduje na kolejce. 

Konstrukcja `new LinkedBlockingQueue<>()` sprawia, że tworzona jest nieskończona[^1] kolejka (!). 

Oznacza to, że gdy wątki executora nie będą nadążać za obsługą kolejnych zadań z kolejki będzie ona rosła i rosła w konsekwencji prawdopodobnie prowadząc do "wybuchu" Twojej aplikacji. 

Liczba obiektów w kolejce będzie tak duża, że zwyczajnie aplikacji braknie pamięci. 

W ten sposób doprowadzisz do `OutOfMemoryException`. 

(Kolejka o nieograniczonej długości) ![Kolejka Alt](https://strony.sztukakodu.pl/wp-content/uploads/2019/02/newFixedThreadPool1-300x290.jpg) 
 ![image](https://strony.sztukakodu.pl/wp-content/uploads/2019/02/newFixedThreadPool2-300x300.jpg) (Kolejka z ustaloną długością)

Co robić zamiast tego? Dużo lepszym rozwiązaniem jest korzystanie z kolejki o z góry określonej pojemności. 

Dzięki temu będziesz wiedział jak duża może być kolejka zadań, z której Executor będzie korzystał. 

W przypadki, gdy w kolejce nie będzie więcej miejsca nowe zadania będą po prostu odrzucane. 

Twoja aplikacja będzie odporna na przypadkowe zalanie kolejki zbyt dużą liczbą zadań. 

W tym celu możesz ponownie użyć `LinkedBlockingQueue`, jednak tym razem podać w konstruktorze maksymalną pojemność. 

Wówczas Executora powinieneś tworzyć za pomocą tej konstrukcji:

```java
Executor executor = new ThreadPoolExecutor(
    10,
    10,
    0L,
    TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<>(1000) // 6
);
````

Tym razem kolejka nie przyjmie więcej niż 1000 zadań. 

Praktyczna zasada jest taka: kolejka powinna być albo zazwyczaj pusta, albo zazwyczaj pełna. 

Jeśli Twoja kolejka nie nadąża z przyjmowaniem zadań oznacza to, że w jakimś innym miejscu aplikacji masz problemy. 

Albo, że powinieneś zwiększyć liczbę wątków. 

Uważaj tylko na ich wpływ na inne części aplikacji. 

Co warto jeszcze zrobić? Warto, żebyś monitorował kolejkę, którą podajesz do Executora. 

Warto periodycznie sprawdzać jej rozmiar by obserwować jak się zachowuje w trakcie działania aplikacji. 


[^1]: nieograniczona długość kolejki w `LinkedBlockingQueue` nie jest do końca prawdą. Kolejka ma pojemność równą stałej `Integer.MAX_VALUE`, która wynosi `2^31 - 1` czyli `2.147.483.647`. W praktyce prawdodpobnie nie uda Ci się dojść do tej wartości, gdyż wcześniej aplikacji zabraknie pamięci.

