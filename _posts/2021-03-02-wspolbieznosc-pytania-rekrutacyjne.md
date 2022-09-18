---
layout:	post
title: Współbieżność - pytania rekrutacyjne. 41 pytań i odpowiedzi
description: Współbieżność to jeden z najważniejszych tematów na drodze rozwoju programisty Java. Jest to też jeden z ulubionych tematów podczas rozmowy rekrutacyjnej. 
image: /images/1500x1000.png
tags: [współbieżność, java, rekrutacja]
---

Współbieżność to jeden z najważniejszych tematów na drodze rozwoju programisty Java. Jest to też jeden z ulubionych tematów podczas rozmowy rekrutacyjnej. 

Aby ułatwić Ci zadanie, przygotowałem dla Ciebie najczęściej powtarzające się pytania (wraz z odpowiedziami!) w jednym wpisie. Zapraszam do środka.

## Pytania Ogólne

### 1. Na czym polega współbieżność?
Współbieżność to możliwość wykonywania wielu operacji jednocześnie. Dzięki współbieżności nasz program jest w stanie obsłużyć wielu użytkowników na raz, wykonywać wiele obliczeń w tym samym czasie i działać wydajniej. Z pomocą wątków poprawia się wykorzystanie procesora i dostępnych na maszynie zasobów.

Współbieżność jest jak zakupy w supermarkecie, w którym klienci mogą swobodnie poruszać się po całej powierzchni sklepu i maksymalnie wykorzystywać swój czas. Przeciwieństwem współbieżności są sklepy starego typu, w których wszystkie towary są za ladą, a w jednej chwili może być obsługiwany tylko jeden klient.

### 2. Jakie są największe benefity współbieżności?
Maksymalne wykorzystanie procesora, możliwość obsługi większego ruchu, brak tracenia czasu podczas czekania na operacje wejścia / wyjścia.

### 3. Jakie są największy wyzwania związane ze współbieżnością?
Spójność danych, synchronizacja pracy wątków, zapobieganie zakleszczeniom i wywłaszczeniom wątków. Efektywna koordynacja pracy wątków - tak by zminimalizować fragmenty czasu, w którym muszą bezczynnie czekać lub blokować się w oczekiwaniu na pracę innych wątków.

## Pytania o Wątki

### 1. Co to jest wątek? Czym się różni od procesu?
Część programu wykonywana współbieżnie w obrębie jednego procesu; w jednym procesie może istnieć wiele wątków. (za [Wikipedią](https://pl.wikipedia.org/wiki/W%C4%85tek_(informatyka)))

Wątki z jednego procesu współdzielą przestrzeń adresową oraz struktury systemowe (otwarte pliki, sockety). Procesy posiadają niezależne zasoby.

Dzięki współdzielonej przestrzeni adresowej wątki mogą się ze sobą komunikować, ale trzeba uważać jak to robią.

Analogia ze świata realnego: procesy to rodziny żyjące osobno, nie mające ze sobą kontaktu, mające własne zasoby (dom, samochód, sprzęt RTV / AGD). Wątki to członkowie tych rodzin konkurujący ze sobą o wspólne zasoby (łazienka, konsola, itd.). 

### 2. Jak uruchomić wątek w Javie?
Najprościej (ale niekoniecznie najlepiej) za pomocą metody `Thread#start`.

```java
Runnable task = ...;
Thread thread = new Thread(task);
thread.start();
```

Można też rozszerzyć klasę `Thread` własną i nadpisać w niej metodę `#run()`, ale to też nie jest najlepsze rozwiązanie.

Najlepiej skorzystać z [pul wątków](#pule-watkow) i tam przekazać zadanie do wykonania.

### 3. Różnica między Runnable i Callable?
`Runnable` i `Callable` to interfejsy służące do przekazywania zadań do wątków. Różnią się sygnaturą. `Runnable` posiada metodę `run` zwracającą typ `void`, a `Callable` posiada metodę `call` zwracającą generyczny typ (deklarowany przy tworzeniu instancji).

Aby wystartować `Runnable` wystarczy przekazać go do klasy `Thread`.

```java
Runnable job = () -> System.out.println("Just doin my job");
Thread thread0 = new Thread(job);
thread0.start();
```

Aby wystartować `Callable` musimy opakować go w klasę `FutureTask`. Konstruktor `Thread` sam z siebie nie przyjmuje interfejsu `Callable` jako argumentu.

```java
Callable<Long> result = () -> 42L;
FutureTask<Long> task = new FutureTask<>(result);
Thread thread = new Thread(task);
thread.start();
task.get();
```

Warto pamiętać, że metoda `Callable#call`  może rzucić wyjątkiem, a `Runnable#run` nie.

### 4. Co się stanie gdy kod w wątku rzuci wyjątkiem?
W przypadku `Callable` zostanie on opakowany w wyjątek `ExecutionException` i rzucony w momencie odbioru wyniku (np. `task#get()` pokazany w poprzednim pytaniu).

W przypadku `Runnable` możemy rzucić tylko wyjątkiem *runtimowym*, a pojawienie się takiego wyjątku spowoduje zabicie takiego wątku - plus obsługę `handlerem`. 

Zachowanie handlera wyjątku można zdefiniować samodzielnie definiując własny `UncaughtExceptionHandler`.

```java
thread0.setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
    @Override
    public void uncaughtException(Thread t, Throwable e) {
       // twoja obslgua wyjatku
    }
});
```

### 5. Co to jest wątek typu Deamon i do czego się przydaje?
Aplikacja w Javie uruchamia się na wątku main. Program działa dopóty, dopóki wszystkie wątki w programie nie zakończą swojej pracy.
Wyjątkiem od tej reguły są wątki typu `deamon`. Nawet jeśli nie zakończyły one swojej pracy, to program może zakończyć swoje działanie (jednocześnie zabijając te wątki).
Wątki `deamon` przydają się to zadań pomocniczych potrzebnych podczas działania programu, jak np. oczyszczanie śmieci, obsługa cyklicznych zadań i tak dalej. Kluczowe jest by ich nagłe ubicie nie powodowało problemów w działaniu aplikacji.

### 6. Co to jest ThreadLocal?
`ThreadLocal` to typ w Javie pozwalający na przypisanie jakichś danych wyłącznie dla pojedynczego wątku. Dzięki temu dana klasa może przechowywać informacje tylko dla tego wątku ze 100% pewnością, że nie zostaną one przeczytane przez inny wątek.

Przykładowo jest to wykorzystywane w Springu, podczas obsługi żądań HTTP (powiązanych z wątkami), gdy dane użytkownika są przypisane w jednym miejscu w stosie wywołań, a mogą być potem odczytane w innym.

## Pule Wątków

### 1. Jak działają pule wątków?
Pula wątków składa się z dwóch elementów - wątków obsługujących zadania oraz kolejki na przyjmowanie tych zadań. Jeśli na pule wątków trafia zadanie, to jest ono wykonywane - w sytuacji gdy dostępny jest wolny wątek - lub czeka w kolejce, aż wolny wątek się pojawi.

### 2. Dlaczego się je stosuje?
Aby zapewnić lepszą stabilność aplikacji. Tworzenie wątków to kosztowna operacja, wiążącą się z utworzeniem wątku w samym systemie operacyjnym i mająca swój narzut czasowy.
O wiele lepiej jest zdefiniować liczbę wątków, którą chce się w aplikacji używać i wykorzystywać je do różnych zadań. Takie wątki mogą przez jakiś czas pozostawać bezczynne, ale i tak jest to wydajniejsze, niż ciągłe tworzenie i ubijanie wątków dla poszczególnych zadań.

### 3. Jakie mamy rodzaje pul wątków w Javie?
Zasadniczo mamy dwa rodzaje pul wątków - o stałej, lub zmiennej liczbie wątków. W tej drugiej sytuacji wątki są tworzone, gdy zadań na kolejce przybywa, oraz ubijanie, gdy przez określony czas liczba zadań do wykonania spada. Zazwyczaj jednak maksymalna ilość wątków w takiej puli jest ograniczona.

W Javie możemy wyróżnić w szczególności:

* pule wątków z 1 wątkiem,
* pule wątków ze stałą liczbą wątków (określaną w momencie tworzenia puli),
* pule wątków ze zmienną liczbą wątków (w zależności od liczby zadań przesłanych do puli).

### 4. Jak tworzy się pule wątków?
W Javie za pomocą fabryki `Executors`

```java
ExecutorService executor = Executors.newFixedThreadPool(4);
executor.submit(task);
```

Lub ręcznie wołając konstruktor odpowiedniej klasy, na przykład

```java
return new ThreadPoolExecutor(
    nThreads, nThreads,  
    0L, TimeUnit.MILLISECONDS,  
    new LinkedBlockingQueue<Runnable>()
);  
```

### 5. Ile zadań można wrzucić na pule wątków?
Tyle ile przyjmuje kolejka obsługująca daną pulę. Przykładowo, w poniższym kodzie może to być ponad 2 miliardy obiektów (`Integer.MAX_VALUE`), natomiast warto pamiętać, że prawdopodobnie zakończy się to brakiem pamięci dla głównego procesu aplikacji.

```java
return new ThreadPoolExecutor(
    nThreads, nThreads,  
    0L, TimeUnit.MILLISECONDS,  
    new LinkedBlockingQueue<Runnable>()
);  
```

Jeśli chcemy ograniczyć długość kolejki wystarczy, że przekażemy ten argument przy konstrukcji `LinkedBlockingQueue` - możemy też przekazać inną implementację kolejki.

### 6. Co się dzieje, gdy wszystkie wątki są zajęte?
Gdy wysyłamy zadanie na pule wątków, której wszystkie wątki są zajęte to czeka ono na kolejce do wykonania, lub w przypadku zapełnienia się całej kolejki, jest odrzucane i wyrzucany jest wyjątek.

## Synchronizacja

### 1. Co to jest sekcja krytyczna? Jak ją utworzyć w Javie?
Sekcja krytyczna to fragment kodu, który chcemy uchronić przed współbieżnym dostępem i zależy nam by mógł go wykonywać jednocześnie tylko jeden wątek na raz. W przeciwnym wypadku groziłoby to niespójnym stanem naszej aplikacji.

Przykładowo, metodę `acceptTransfer` chcielibyśmy objąć taką sekcją krytyczną.

```java
class Account {
	private BigDecimal balance;

	public void acceptTransfer(BigDecimal amount) {
		BigDecimal newBalance = balance.add(amount)
		this.balance = newBalance;
	}
}
```

Jednoczesne wejście do powyższej metody przez wiele wątków mogłoby doprowadzić otrzymania nieprawidłowej wartośći w zmiennej `balance`.

### 2. Jakie znasz struktury do kontroli dostępu do sekcji krytycznej?

1. Słowo kluczowe `synchronized`
2. locki -  `ReentrantReadWriteLock`
3. semafory -  `Semaphore`
4. bariery cykliczne - `CyclicBarrier`
5. latche - `CountDownLatch`

### 3. Co to jest race condition (warunki wyścigu)?
Sytuacja, w której wskutek niemal jednoczesnego wykonania fragmentu kodu przed dwa wątki (bez odpowiedniej synchronizacji) dochodzi do niepoprawnego stanu aplikacji. 

Przykładem jest sytuacja zmiany stanu konta, w której oba wątki jednocześnie odczytują obecny stan - np. 1000 zł, jeden z nich dodaje 100 zł, a drugi odejmuje 500 zł. Bez synchronizacji ostateczny stan konta będzie wynosił 1100 zł lub 500 zł - w zależności, który wątek kiedy skończy swoją pracę, podczas gdy w rzeczywistości powinno to być 600 zł.

### 4. Co to jest deadlock, livelock i starvation?

1. Deadlock - sytuacja, w której dwa wątki wzajemnie czekają na zwolnienie danego warunku przez ten drugi, jednocześnie się blokując. Wątki nie zwalniają trzymanego przez siebie zasobu.
2. Livelock - podobna sytuacja, tylko teraz wątki zwalniają trzymany zasób i uzyskują dostęp do drugiego. Niestety nadal żaden z wątków nie ma dostępu do obu zasobów.
3. Starvation - zagłodzenie. Sytuacja, w której wątki o niższym priorytecie nie uzyskują w ogóle dostępu do danego zasobu.

Przykłady:
1. Deadlock - dwie osoby w restauracji próbują zjeść obiad jednym kompletem sztućców. Jedna łapie za widelec, druga za nóż. Każda z nich czeka na drugi element by zacząć jeść, w efekcie czego nikt nie zjada posiłku.
2. Livelock - podoba sytuacja, ale w tej sytuacji osoby odkładają sztućce na stół i łapią za drugi brakujący element. Nadal żadna z nich nie ma kompletu by skonsumować posiłek.
3. Zagłodzenie - z konsoli do gier w domu ciągle korzysta starszy brat, który nie dopuszcza do zabawy młodszego rodzeństwa.

### 5. Jak działa słowo kluczowe synchronized?
Słowo kluczowe `synchronized` powoduje założenie `locka` na danej instancji obiektu.

```java
class Account {
	private BigDecimal balance;

	public synchronized void acceptTransfer(BigDecimal amount) {
		BigDecimal newBalance = balance.add(amount)
		this.balance = newBalance;
	}
}
```

W tej sytuacji, tylko jeden wątek może korzystać z metody `acceptTransfer` oraz innych metod klasy `Account`, w których słowo `synchronized` jest użyte.

`synchronized` można też użyć w ciele metody `synchronized(this)` lub na innym obiekcie, np. `synchronized(lock)`.

```java
class Account {
	private BigDecimal balance;
	private Object writeLock;

	public void acceptTransfer(BigDecimal amount) {
		synchronized(writeLock) {
			BigDecimal newBalance = balance.add(amount)
			this.balance = newBalance;
		}
	}

}
```

### 6. Co to jest ReentrantLock?
Klasa służąca do synchronizacji dostępu do sekcji krytycznej. Wymaga utworzenia własnej instancji, zachowuje się podobnie do słowa kluczowego `synchronized`, ale daje dodatkowe możliwości.

Przykładem są metody `tryLock` służące do szybkiego powrotu do wykonywania operacji, w momencie gdy `locka` nie uda się uzyskać.

### 7. Czym się różni ReentrantLock od synchronized?
`ReentrantLock` to klasa, wymagająca utworzenia własnej instancji, posiadająca własne metody, które trzeba zawołać aby doprowadzić do ochrony sekcji krytycznej kodu.

`synchronized` to słowo kluczowe języka, które można umieścić w sygnaturze metody, lub stosować jako blok kodu.

`ReentrantLock` daje większą kontrolę nad tym jak powinien zachować się wątek w momencie wchodzenia do sekcji krytycznej.

### 8. Jak doprowadzić do Deadlocka?
Wystarczy, że dwie metody będą próbowały uzyskać ekskluzywny dostęp do dwóch tych samych zasobów w odwrotnej kolejności. Tak jak w tym fragmencie kodu.

```java
class Account {
	private BigDecimal balance;
	private Map<String, BigDecimal> history; 

	public void acceptTransfer(BigDecimal amount) {
		synchronized(balance) {
			synchronized(history) {
				BigDecimal newBalance = balance.add(amount)
				this.balance = newBalance;
				this.history.put("new-transfer", amount);
			}
		}
	}

	public void withdrawMoney(BigDecimal amount) {
		synchronized(history) {
			synchronized(balance) {
				BigDecimal newBalance = balance.subtract(amount)
				this.balance = newBalance;
				this.history.put("withdrawal", amount);
			}
		}
	}
}
```

Obie metody - `acceptTransfer` i `withdrawMoney` potrzebują dostęp do `history` oraz `balance` na wyłączność, ale robią to w odwrotnej kolejności.

Gdy wątek w `acceptTransfer` uzyska dostęp do `balance` a wątek w `withdrawMoney` uzyska dostęp do `history` oba będą czekać w nieskończoność na uzyskanie dostępu do drugiego zasobu.

### 9. Jak sobie poradzić z Deadlockiem?

Są dwie opcje:

1. uzyskiwanie locków za pomocą `ReentrantLock`-a i wołanie metody `tryLock`. W przypadku porażki, powrót z metody bez wykonania odpowiedniego kodu.
2. układanie pobierania dostępu do zasobów w takiej samej kolejności. Powyższy fragment kodu pozbędzie się deadlocka, gdy obie metody będą najpierw sięgać po jeden zasób, a potem po drugi.


```java
class Account {
	private BigDecimal balance;
	private Map<String, BigDecimal> history; 

	public void acceptTransfer(BigDecimal amount) {
		synchronized(balance) {
			synchronized(history) {
				BigDecimal newBalance = balance.add(amount)
				this.balance = newBalance;
				this.history.put("new-transfer", amount);
			}
		}
	}

	public void withdrawMoney(BigDecimal amount) {
		synchronized(balance) {
			synchronized(history) {
				BigDecimal newBalance = balance.subtract(amount)
				this.balance = newBalance;
				this.history.put("withdrawal", amount);
			}
		}
	}
}
```

### 10. Co to jest CyclicBarrier?
Klasa służąca do cyklicznego uruchamiania wątków w grupach. Przykładowo, chcemy zacząć wykonywać zadanie, gdy pojawi się 5 wątków gotowych do wykonania.

```
CyclicBarrier cyclicBarrier = new CyclicBarrier(5);
```

Może się to przydać, gdy chcemy zsynchronizować moment startu pracy kolejnych grup wątków.

### 11. Jak działa Atomic Integer?
`AtomicInteger` to klasa zapewniająca bezpieczeństwo wielowątkowe w operacjach dotyczących liczb całkowitych. Korzysta z operacji procesora *Compare-And-Swap* (CAS).

### 12. Do czego służy słowo kluczowe volatile?
`volatile` to słowo kluczowe instruujące kompilator, by zawsze sięgał do rejestrów procesora odczytując i zapisując wartość do pola oznaczonego tym słowem. Tym samym kompilator nie będzie w żaden sposób *cache-ował* tej wartości w celach optymalizacyjnych. Dzięki temu mamy pewność, że przy dostępie wielowątkowym wartość / obiekt przypisanych do tej zmiennej jest świeży.

### 13. Na czym polega relacja Happens-Before?
*Happens-Before* jest gwarancją, że dane operacje w kodzie wykonają się w odpowiedniej kolejności i związana jest z barierą pamięci oraz potencjalnymi optymalizacjami kompilatora i procesu.

W momencie, gdy JVM wykonuje instrukcje naszej aplikacji, może zmieniać kolejność tych instrukcji (w bezpieczny, optymalny sposób). Korzystanie jednak z klas, metod związanych z synchronizacją wątków zapewnia nas, że zmiana kolejności instrukcji przez JVM nie przekroczy miejsca, w którym ta synchronizacja się odbywa.

Dlatego tym bardziej istotne jest, byśmy wrażliwe na zniszczenie stanu aplikacji fragmenty kodu odpowiedni synchronizowali.

## Kolekcje

### 1. Jakie mamy kolekcje w świecie współbieżnym?
Najważniejsze to:
1. kolekcje starego typu - jak np. `Vector`
2. kolekcje synchronizowane - tworzone za pomocą metod `Collections.synchronizedXXX`
3. kolekcje współbieżne - jak np. `ConcurrentHashMap`, `CopyOnWriteArrayList`, czy  `BlockingQueue`.

### 2. Jak działają kolekcje synchronized?
Kolekcja utworzona przez `Collections.synchronizedXXX` zapewnia jednowątkowy dostęp do wszystkich metod danej kolekcji. Z jednej strony daje to bezpieczeństwo wielowątkowe, ale z drugiej obarczone jest dużym kosztem wydajnościowym.

### 3. Jak działa ConcurrentHashMap?
`ConcurrentHashMap` to odpowiedź na kolekcje synchronizowane. W jej przypadku `lock` zakładany jest na dany klucz. Dzięki temu wiele wątków może jednocześnie korzystać z tej mapy, a do blokady dochodzi dopiero w momencie, gdy na mapie chcą operować wątki korzystające z jednego klucza.

### 4. Jakie są rodzaje kolejek i do czego się przydają?
Kilka implementacji to:
1. `LinkedBlockingQueue`,
2. `SynchronousQueue`,
3. `PriorityQueue`,
4. `DelayQueue`.

Klasy te świetnie sprawdzają się do rozdzielenia synchronizacji wątków. Zamiast pozwalać wątkom rozmawiać między sobą, mogą one wymieniać zadania / komunikaty poprzez umieszczanie i ściąganie ich z kolejek.

## Zadania, Future, CompletableFuture

### 1. Co to jest Future? Do czego służy?
`Future` to klasa służąca do deklaracji wyniku, który wydarzy się w przyszłości. Przykładowo jest zwracana z metody `ExecutorService#submit`.

```java
Callable<String> task = ...; 
ExecutorService executor = Executors.newFixedThreadPool(4);
Future<String> result = executor.submit(task);
result.get();
```

Metoda `get()` zwróci wynik, gdy ten będzie dostępny.

### 2. Różnice Future vs CompletableFuture?
`CompletableFuture` to ulepszona wersja typu `Future` wprowadzona w Javie 1.8.
Pozwala na łańcuchowanie kolejnych operacji wywoływanych na wyniku z wykonania zadania. API jest zbliżone do dobrze znanego StreamAPI służącego do pracy ze strumieniami w Javie.

### 3. Jakie znasz alternatywy do CompletableFuture?
`CompletableFuture` to typ wbudowany w język. Warto zainteresować się też alternatywami jak bardzo popularna `RxJava`, czy nawiązujący do operacji asynchronicznych framework `Akka`.

## Strumienie

### 1. Jak działa parallel w Stream API? Na jakiej puli wątków się uruchamia? Na co warto uważać?
Korzystając z metody `parallel` w Streamach sprawiamy, że operacje na elementach uruchomią się na wielu wątkach.

W tym celu wykorzystana będzie pula wątków `ForkJoinPool#commonPool`. Warto zwrócić uwagę, że nie mamy wtedy kontroli nad kolejnością w jakiej elementy strumienia zostaną ostatecznie przetworzone.

Należy też uważać na nadmierne używanie tej metody. Wołając `parallel` w jednym miejscu na blokujących operacjach (np. wołanie zewnętrznego API) możemy spowolnić wykonanie innych operacji wykorzystujących tylko CPU naszego serwera.

## Testowanie

### 1. Czy można testować kod współbieżny? Jak?
Tak. Należy napisać testy, w których będziemy uruchamiać wiele wątków na raz i sprawdzać czy wyniki są spójne. Przydadzą się też takie biblioteki jak Awaitility czy ConcurrentUnit.

## Najlepsze praktyki

### 1. Jakich kilka najlepszych rad dałbyś w kontekście pisania kodu współbieżnego?

1. Twórz jak najwięcej kodu, który może być bezpiecznie uruchomiony przez wiele wątków
2. Unikaj tworzenia sekcji krytycznych, jeśli problem można rozwiązać w inny sposób
3. Stosuj klasy niemutowalne
4. Korzystaj z pul wątków, kolekcji współbieżnych, kolejek
5. Wykorzystuj operacje asynchroniczne
6. Dziel problemy, algorytmy na mniejsze części, które można bezpiecznie zrównoleglić

### 2. Jak zaimplementowałbyś problem producenta i konsumenta?
Za pomocą kolejki blokującej i dwóch pul wątków. Jedna pula wątków zajmuje się produkowaniem wyników i umieszczaniem ich na kolejce, a druga zajmuje się ich konsumowaniem i ściąganiem z kolejki.
Dzięki temu wątki z dwóch grup nie muszą się ze sobą komunikować, a jedynie wymieniać obiekty na bezpiecznej wielowątkowo kolejce.

### 3. Jak zaimplementowałbyś licznik odwiedzin podstron WWW?

Wykorzystując klasę `ConcurrentHashMap` i kontrakt metody `compute`, która jest wykonywana atomowo. Dzięki temu mam pewność, że przekazana lambda wykona się z zachowaniem bezpiecznego dostępu wielowątkowego. Nie ma konieczności korzystać w tej sytuacji z typu `AtomicLong`.

```java
class VisitsCounter {
    private final ConcurrentHashMap<String, Long> visits = new ConcurrentHashMap<>();

    public void markVisit(String subpage) {
        visits.compute(subpage, (key, currentValue) -> currentValue != null ? currentValue + 1 : 1);
    }
}
```

### 4. Jak zaimplementować wzorzec Singleton?

Najprostsze rozwiązanie - wykorzystując enuma. Wówczas nie musimy się martwić o kwestię współbieżności, gdyż tę załatwi nam sama Java. Nie utworzy więcej niż jednej instancji typu EnumSingleton.

```java
enum EnumSingleton {
    INSTANCE;

    EnumSingleton() {
        System.out.println("Enum constructed...!");
    }

    public static void touchClass() {
        System.out.println("Enum class touched");
    }
}
```

Minusem jest to, że ta instancja jest tworzona w sposób zachłanny.

Co jeśli, chcielibyśmy utworzyć instancje singletona w sposób leniwy? 

Wówczas mamy dwie opcje.

Opcja 1 - z wykorzystaniem wykorzystaniem `volatile` i `synchronized`. Wykorzystujemy tutaj tak zwany wzorzec podwójnego sprawdzania blokowania (*double-checked locking*).

```java
final class LazySingleton {

    private static volatile LazySingleton instance;

    private LazySingleton() {
        System.out.println("Lazy constructed...!");
    }

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }

    public static void touchClass() {
        System.out.println("Lazy class touched");
    }
}
```

Opcja 2 - z pominięciem słów kluczowych ze świata współbieżności, to ponownie wykorzystanie właściwości języka Java i utworzenie klasy wewnętrznej.

```java
final class HolderSingleton {

    private HolderSingleton() {
        System.out.println("Holder constructed...!");
    }

    private static class Holder {
        private static final HolderSingleton INSTANCE = new HolderSingleton();
    }

    public static HolderSingleton getInstance() {
        return Holder.INSTANCE;
    }

    public static void touchClass() {
        System.out.println("Holder class touched");
    }
}
```

To kiedy dane obiekty zostają utworzone możemy sprawdzić uruchamiając poniższy kod.

```java
class Scratch {
    public static void main(String[] args) {
        System.out.println("Starting...");
        EnumSingleton.touchClass();
        LazySingleton.touchClass();
        HolderSingleton.touchClass();
        System.out.println("DONE!");
    }
}
```

Który wyprodukuje następujący wynik.

```
Starting...
Enum constructed...!
Enum class touched
Lazy class touched
Holder class touched
DONE!
```


Zauważ, że konstruktor typu `EnumSingleton` został zawołany, podczas gdy pozostałe nie. Zostaną one wywołane dopiero podczas użycia metody `#getInstance()`.

## Podsumowanie
Zrozumienie - przynajmniej podstaw - [współbieżności](https://kurswspolbieznosci.pl) to jedno z najważniejszych zadań w rozwoju kariery programisty Java. Warto dobrze przestudiować ten temat, aby po pierwsze - dobrze wypaść na rozmowie o pracę, a po drugie - tworzyć bezpieczne wielowątkowo aplikacje.

Jeśli chcesz, możesz nauczyć się współbieżności razem ze mną dołączając do [Kursu Współbieżności](https://kurswspolbieznosci.pl), w którym przechodzimy przez wszystkie te tematy. 

Powodzenia!
