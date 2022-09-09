---
layout: post
title:  17 Błędów Początkujących ze Współbieżnością
description: Temat współbieżności nie należy do najłatwiejszych obszarów programowania. Na początku nauki często jest pomijany. Młodzi programiści skupiają się na nauce języka, paradygmatów programowania, czy pracy z bazą danych. Pominięcie temu współbieżności może jednak prowadzić do poważnych problemów. W tym wpisie przedstawię Ci 17 błędów, które często popełniają początkujący w tym zakresie.
date:   2021-02-11 13:24:35 +0200
image:  'https://sztukakodu.pl/wp-content/uploads/2021/02/bledy-wspolbizenosc.png'
tags:   [java, wspołbieżność, wielowątkowość]
---

Temat współbieżności nie należy do najłatwiejszych obszarów programowania. Na początku nauki często jest pomijany. Młodzi programiści skupiają się na nauce języka, paradygmatów programowania, czy pracy z bazą danych. Pominięcie temu współbieżności może jednak prowadzić do poważnych problemów. W tym wpisie przedstawię Ci 17 błędów, które często popełniają początkujący w tym zakresie.

<!--more-->

# 1. Ignorowanie problemu współbieżności
Podstawowym problemem jest ignorowanie tematu współbieżności.

Niestety. Frameworki - nawet najlepsze - tego za nas nie załatwią. Jeśli nie zwrócimy uwagi na ten temat, to możemy być w dużych tarapatach.

Zastanów się więc:
- co się stanie, gdy z Twojej aplikacji zacznie korzystać 10, 100, 1.000 użytkowników na raz?
- jak zachowają się wtedy Twoje struktury danych?
- co się stanie, gdy wiele requestów na raz będzie chciało odczytać, bądź modyfikować dany zasób?
- co jeśli danych, które przetwarzasz będzie 10, 100, 1.000 razy więcej niż na Twojej lokalnej maszynie?
- na jakich pulach wątków tworzone są Twoje operacje?

Bez znajomości podstaw bardzo łatwo o tworzenie aplikacji pełnej dziur, błędów i problemów.

# 2. Ręczne tworzenie wątków
Aby stworzyć nowy wątek w Javie wystarczy zawołać `new Thread()`. Jak każdy inny obiekt.

Ale! Wątek nie jest zwykłym obiektem. Wiąże się on z fizycznym utworzeniem wątku w systemie operacyjnym czy zalokowaniu dla niego obszaru pamięci (na stos wątku). Co więcej system operacyjny limituje ile takich wątków może być w ogóle utworzonych. Dodatkowo wiąże się to też z narzutem czasowym.

Dlatego jeśli kusi cię, by samodzielnie tworzyć nowe wątki na swoje operacje, to nie idź tą drogą. Zamiast tego korzystaj z [pul wątków](https://sztukakodu.pl/co-warto-wiedziec-o-pulach-watkow-w-javie-najlepszy-przewodnik-jakiego-potrzebujesz/), które dużo wydajniej zajmują się tworzeniem i utrzymywaniem przy życiu wątków. Dobrze skonfigurowane nakładają też na nie odpowiednie limity.

# 3. Nieprawidłowe stosowanie pul wątków
Skoro już wiesz, że pule wątków (`Executors` i `ExecutorsService` w Javie) sprawdzają się lepiej niż ręczne tworzenie wątków, to jak z nich dobrze korzystać?

Po pierwsze - nie twórz pul wątków per zadanie.

De facto wystarczą Ci 4 rodzaje pul wątków:

1. Do obsługi requestów webowych - tej zazwyczaj nie musisz tworzyć samodzielnie, gdyż jest dostarczona przez twój framework - np. Spring
2. Do obsługi intensywnych operacji na procesorze - CPU - bound (tyle wątków ile rdzeni Twojego procesora) - jeśli często wykonujesz kalkulacje które mocno obciążają procesor, to można je wykonywać na takiej puli wątków
3. Do obsługi urządzeń wejścia-wyjścia (IO) - np. pule wątków do komunikacji z zewnętrznymi serwisami (po API), z bazą danych, może z użytkownikiem (w tym wypadku możesz tworzyć dedykowane pule wątków pod rodzaj komunikacji, np. osobna do bazy danych, osoba do żądań HTTP, osobna do interakcji z użytkownikiem)
4. Do obsługi zadań cyklicznych - 1-wątkowa pula wątków. Jeśli zastosujesz tę pulę wątków tylko do startowania zadań cyklicznych, a samą obsługę tych zadań przeniesiesz na inne pule wątków, wówczas wystarczy Ci nawet 1-wątkowa. Jeśli zadań cyklicznych masz zdecydowanie więcej, możesz rozważyć więcej pul wątków.

# 4. Nienazywanie wątków w pulach wątków
Gdy już tworzysz własne pule wątków, warto zaopiekować się nazewnictwem takich wątków. Pomoże Ci to w debugowaniu i czytaniu logów z aplikacji.

W tej sytuacji w momencie tworzenia puli wątków przekaż do niej obiekt `ThreadFactory`, który zajmie się tym problemem.

```java
ThreadFactory namedThreadFactory = 
  new ThreadFactoryBuilder().setNameFormat("my-sad-thread-%d").build()
```

Klasa `ThreadFactoryBuilder` pochodzi z [Guavy](https://guava.dev/releases/snapshot/api/docs/com/google/common/util/concurrent/ThreadFactoryBuilder.html).

# 5. Stosowanie pul wątków o nieograniczonej długości
Do tworzenia pul wątków w Javie często korzysta się z dostarczonych fabryki `Executors`. Należy być z nią jednak ostrożnym. Spójrzmy do jej wnętrza.

```java
public static ExecutorService newFixedThreadPool(int nThreads) {  
    return new ThreadPoolExecutor(
        nThreads, nThreads,  
      0L, TimeUnit.MILLISECONDS,  
      new LinkedBlockingQueue<Runnable>()
    );  
}
```

Ostatni argument wskazuje na kolejkę, na której będą przechowywane zadania oczekujące w kolejce na wykonanie. Użyto tutaj struktury danych:

```java
new LinkedBlockingQueue<Runnable>()
```

której ograniczenie na liczbę przyjmowanych zadań wynosi:

```java
public LinkedBlockingQueue() {  
    this(Integer.MAX_VALUE);  
}
```

2.147.483.647 obiektów.

Zastanów się, czy Twojej aplikacji wystarczy pamięci by taką liczbę zadań obsłużyć?

Dlatego dużo lepszym rozwiązaniem jest stosowanie ograniczonej kolejki - nawet jeśli nie wiesz ile obiektów dana pula wątków przyjmie i ręczne tworzenie puli wątków, na przykład w taki sposób:

```
return new ThreadPoolExecutor(
  nThreads, nThreads,  
  0L, TimeUnit.MILLISECONDS,  
  new LinkedBlockingQueue<Runnable>(100)
); 
```

W tym wypadku w kolejce będzie maksymalnie 100 oczekujących zadań.

# 6. Brak obsługi odrzuconych zadań
Jeśli limit zadań na puli wątków zostanie przekroczony, to co się wtedy stanie? Domyślnie zostane rzucony wyjątek. Ale możesz też dostarczyć własne zachowanie.

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    nThreads, nThreads,
    0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<Runnable>(100),
    new RejectedExecutionHandler() {
        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
          logger.info("[" + Thread.currentThread().getName() + "] I am Full, sorry bro");
        }
    }
);
```

W tym wypadku musisz przekazać jeszcze jeden parametr do tworzenia puli wątków - `RejectedExecutionHandler`. Możesz napisać własny, lub skorzystać z gotowych implementacji, które znajdziesz w klasie `ThreadPoolExecutor`.

# 7. Brak obsługi wyjątków z wątków
Czy wiesz co się stanie, jesli w twoim zadaniu zostanie rzucony wyjątek? Wątek zginie, a wyjątek może nie zostać w żaden sposób zarejestrowany. W tym celu upewnij się, że tworząc wątki (przez pule wątków, o czym już wiesz z punktu 2) rejestrujesz w nich instancję klasy `Thread.UncaughtExceptionHandler`, w której definiujesz co ma się stać z rzuconym wyjątkiem - minimum to zalogowanie wyjątku do logów.

```java
new ThreadFactoryBuilder()
    .setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
        @Override
        public void uncaughtException(Thread thread, Throwable error) {
            logger.error("CUSTOM EXCEPTION HANDLER:", error);
        }
    })
    .build();
```
 
# 8 Stosowanie zwykłych kolekcji
Programując w Javie intensywnie korzystamy z kolekcji takich jak Listy, Sety czy Mapy. Do wielu zastosowań są one właściwymi kolekcjami, ale nie każda ich implementacja dobrze sprawdza się w sytuacjach współbieżnych. Jeśli daną kolekcję mogą w jednej chwili modyfikować większe ilości wątków warto zastanowić się czy będzie to bezpieczne i jak się przed tym zabezpieczyć.

# 9. Stosowanie synchronizowanych kolekcji
Jednym ze sposobów zabezpieczenia przed współbieżnym dostępem do kolekcji jest stosowanie kolekcji synchronizowanych. Tworzy się je za pomocą metod z klasy fabryki `Collections` takich jak: `synchronizedList`, `synchronizedMap` czy `synchronizedSet`. I o ile zabezpieczają one przed współbieżnym dostępem, o tyle robią to z dużym narzutem wydajnościowym. W jednej chwili z kolekcji może korzystać tylko jeden wątek. 

Zamiast tego lepiej korzystać z dedykowanych kolekcji o lepszej charakterystyce wydajnościowej.
Przykładem mogą być: `ConcurrentHashMap`, `CopyOnWriteArrayList` czy `ConcurrentLinkedQueue`.

# 10. Brak stosowania operacji atomowych z kolekcji
Gdy już stosujemy odpowiednie kolekcje, warto skorzystać z odpowiednich metod zapewniających atomowość operacji.

Przykładowo, błędem jest poniższy kod:

```java  
ConcurrentHashMap<String, Long> counter = new ConcurrentHashMap<>();
if(counter.contains("sztukakodu")) {  
    counter.put("sztukakodu", 1L);  
} else {  
    counter.put("sztukakodu", counter.get("sztukakodu") + 1L);  
}
```

Te operacje nie są atomowe i w międzyczasie zawartość mapy może zostać zmodyfikowana prowadząc do niewłaściwych wyników.

Zamiast tego, warto korzystać z metod atomowych, jak `compute`:

```java
counter.compute("sztukakodu", new BiFunction<String, Long, Long>() {  
    @Override  
  public Long apply(String key, Long currentValue) {  
        return currentValue != null ? currentValue + 1 : 1L;  
 }  
});
```

Jak wskazuje [dokumentacja](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html#compute(K,java.util.function.BiFunction)):

> The entire method invocation is performed atomically

Dzięki temu mamy pewność, że ostateczne wyniki będą poprawne.

# 11. Niekorzystanie z kolejek
Jedną z rzadziej stosowanych, a niezwykle użytecznych kolekcji w Javie, jest kolejka - `Queue`. Język dostarcza nam wielu implementacji, takich jak:

```ArrayBlockingQueue, ArrayDeque, ConcurrentLinkedDeque, ConcurrentLinkedQueue, DelayQueue, LinkedBlockingDeque, LinkedBlockingQueue, LinkedList, LinkedTransferQueue, PriorityBlockingQueue, PriorityQueue, SynchronousQueue```.

Kolejki świetnie sprawdzają się w środowisku wielowątkowym, w którym z jednej strony umieszczamy na kolejce jakieś zadanie do wykonania / wynik jakiejś operacji, a z drugiej konsujemy je w celu wykonania lub dalszego przetworzenia.

Dzięki kolejkom nie musimy komunikować się bezpośrednio między wątkami, a możemy wygodnie przekazywać obiekty i wymieniać się komunikatami.

# 12. Niewłaściwe korzystanie z parallelStream
Wprowadzone w Javie 8 Streamy już na dobre zadomowiły się w aplikacjach Javowych. W klasie `Stream` kryje się metoda `parallel`, która uruchamia cała sekwencję operacji na wielu wątkach.

Ale uwaga! W ramach jednej aplikacji wszystkie operacje zrównoleglone za pomocą `parallel` wykonują się na jednej puli wątków - `ForkJoinPool.commonPool`. 

Składa się z liczby wątków równej liczbie rdzeni minus 1. To oznacza - dla 4-rdzeniowego procesora - że będzie ich tylko 3. 

O ile wykonujemy jedynie operacje oparte o procesor, nie będzie to problemem. Ale gdy za pomocą `Stream#parallel` będziemy chcieli zrównoleglić zawołania do zewnętrznych usług / serwisów (np. API), które mogą trwać od 100 ms do 30 sekund, wówczas możemy mieć poważne problemy. 

Wystarczy, że w kilku miejscach aplikacji zastosujemy takie zachowanie i operacje będą konkurować o wątki dostępne w `commonPooli` ostatecznie prowadząc do obniżenia wydajności i długiego oczekiwania na wyniki.

# 13. Brak stosowania transakcji
Nie raz zdarza się, że w ferworze implementacji zachowań biznesowych młodzi programiści zapominają o przemyśleniu kwestii transakcji w danych operacjach. O ile w Springu robi się to dość łatwo adnotacją `@Transactional` - i łatwo to przeoczyć - o tyle warto zwrócić na to szczególną uwagę.

Brak zakładania transakcji może prowadzić do poważnych błędów w aplikacji i niespójności danych, które może być trudno rozwiązać po fakcie.

# 14. Stosowanie zbyt dużych transakcji
Innym problemem jest zakładanie zbyt dużych transakcji.

Wyobraźmy sobie sytuację, że cyklicznie wysyłasz maile do swoich użytkowników. 

```java
class NotificationJob {  
    UsersRepository users;  

  @Transactional  
    @Scheduled(fixedRate = "60_000")  
    public void run() {  
        users.forEach(this::sendNotifications);  
  }  
      
    private void sendNotifications(User user) {  
        // ...  
  }  
}
```

Zakładanie transakcji nad całą operacją może wysycić Ci pulę połączeń do bazy danych oraz prowadzić do niespodziewanych błędów.

Zamiast tego transakcja powinna być otwierana i zamykana na możliwie najmniejszy fragment kodu - w tym wypadku na przykład obsługę pojedynczego użytkownika.

# 15. Brak stosowania Optimistic Locking
Pracując z bazami danych warto pamiętać o tym, co się dzieje, gdy wiele wątków jednocześnie próbuje modyfikować nasze encje. Czy jesteś przed tym zabezpieczony?

Co się stanie, gdy dwa wątki, jeden po drugim będą chciały zapisać zmiany w encji? Które dane na końcu będą właściwie?

Jeśli odpowiednio się nie zabezpieczysz, wygra ostatni zapis. A nie zawsze może to być właściwe zachowanie.

Zamiast tego warto stosować `Optimistic Locking` za pomocą adnotacji `@Version`.

```java
class Book {
  // ...
  
  @Version
  private long version;

}
```

Dzięki temu upewnisz się w środowisku Spring / Hibernate, że w przypadku współbieżnego zapisu, drugi się nie uda powodując wyrzucenie wyjątku. A Ty będziesz mógł przekazać kontrolę użytkownikowi, by sam zdecydował jaka ma być ostateczna wartość.

# 16. Współdzielenie mutowalnych obiektów
Jedną z najważniejszych technik ułatwiających pracę w środowisku współbieżnym jest stosowanie niemutowalnych obiektów. Znasz takie na codzień - to na przykład `String`, czy `BigDecimal`.

Można je bezpiecznie dzielić między wątkami, nie obawiając się o zmianę ich stanu.

Staraj się sam też tworzyć niemutowalne obiekty, które można łatwo współdzielić, a te mutowalne traktuj z należytą starannością. Tak, by nie doprowadzić do nieoczekiwanych modyfikacji. Do odczytu zwracaj ich kopie, a w momencie modyfikacji upewnij się, że robisz to w sposób bezpieczny i rozumiesz jakie są tego konsekwencje.

# 17. Brak stosowania równoległych operacji w komunikacji z zewnętrznymi usługami
Ostatni częsty błąd początkujących to niekorzystanie ze współbieżności tam gdzie ona najbardziej się przyda. A jest to przede wszystkim komunikacja z zewnętrznymi usługami.

Jeśli w jednej operacji odpytujemy kilkoma żądaniami zewnętrzne usługi to aż prosi się wykonać to na wielu wątkach. Można w tym celu skorzystać z puli wątków i `CompletableFuture`. A na końcu zebrać wyniki w jeden rezultat.

Wtedy zamiast np. czekać na odpowiedź z 5 serwisów przez 1 sekundę (gdzie każdy opowiada po 200ms), mamy cały wynik w okolicach wyniku najwolniejszego z nich - potencjalnie około 200 milisekund.

## Podsumowanie
Współbieżność to potężne i potrzebne narzędzie w codziennej pracy programisty. Dzięki niemu nasze aplikacje mogą pracować wydajnie, efektywnie i szybko spełniać powierzone im zadanie. Bez zrozumienia jej działania i zwrócenia uwagi na podstawowe błędy możemy narobić sobie dużo problemów.
Upewnij się, że znasz podstawy współbieżności, rozumiesz jakie konsekwencje mogą mieć Twoje działania i jak się ustrzec przed najpoważniejszymi wadami.