---
layout: post
title: Co warto wiedzieć o pulach wątków w Javie? - Najlepszy przewodnik jakiego potrzebujesz 🎢
description: 
image: /images/pule-watkow.png
tags: [pule-watków, wspolbieznosc, wielowatkowosc]
---

Jednym z najważniejszych czynników zwiększającą wydajność aplikacji w Javie jest możliwość korzystania z wątków. Dzięki zrównolegleniu niektórych działań efektywność programu może znacząco wzrosnąć. Przy pracy z wątkami warto jednak pamiętać o dobrych praktykach, między innymi o korzystaniu z pul wątków. Ale jak to dobrze robić? O tym w niniejszym artykule.Obsługę cyklicznych, występujących jednocześnie zdarzeń warto często zrównoleglić. Na przykład obsługa żądań HTTP, zapytań do bazy danych, odpytywania zewnętrznych serwisów, czy wykonywania wymagających obliczeń matematycznych. Możemy to uzyskać poprzez korzystanie z wątków. Ale warto pamiętać, że tworzenie nowych wątków per każde takie działanie jest bardzo kosztowne. Wymaga stworzenia prawdziwego wątku w systemie operacyjnym, zaalokowania pamięci, stworzenia deskryptora wątku. Wszystko to kosztuje. W sytuacji, gdy dane zadanie będzie żyć stosunkowo krótko i dany wątek zaraz będziemy ubijać jest to marnowanie zasobów. Zamiast tego dużo lepiej jest skorzystać z puli wątków, za pomocą której będziemy tylko wskazywać jakie zadanie ma być wykonane, a pula wątków samodzielnie zadba o to by przypisać wolny wątek do wykonania tego zadania. W Javie pule wątków są opisywane przez dwa interfejsy.

1. Executor
2. ExecutorService
Pierwszy jest bardzo prosty i zawiera jedną metodę.

    public interface Executor {
        void execute(Runnable command);
    }

Dzięki niemu możemy przekazać nasze zadanie (poprzez implementację interfejsu `Runnable`) do wykonania na puli wątków. Drugi z nich zaś służy do wykonywania zadań i zarządzania całą pulą wątków. Posiada zdecydowanie bogatszy zakres metod.

    public interface ExecutorService extends Executor {
        List<Runnable> shutdownNow();
    
        boolean isShutdown();
    
        boolean isTerminated();
    
        boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException;
    
        <T> Future<T> submit(Callable<T> task);
    
        <T> Future<T> submit(Runnable task, T result);
    
        Future<?> submit(Runnable task);
    
        <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException;
    
        <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException;
    
        <T> T invokeAny(Collection<? extends Callable<T>> tasks) throws InterruptedException, ExecutionException;
    
        <T> T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
    }

Większość z metod dość jasno mówi do czego służy, więc zostawiam to uważnemu czytelnikowi do samodzielnego przeanalizowania. Oprócz powyższych dwóch interfejsów warto wspomnieć o jeszcze jednym: **ScheduledExecutorService**.

    public interface ScheduledExecutorService extends ExecutorService {
    
        public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);
    
        public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit);
    
        public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit);
    
        public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit);
    }

Jak widać na powyższym listingu za pomocą tego typu możemy:
1. uruchomić pojedyncze zadanie w przyszłości: `schedule(Runnable ...`) i `schedule(Callable<V> ...`)
2. uruchomić zadanie cykliczne w stałym odstępie czasowym: `scheduleAtFixedRate`
3. uruchomić zadanie cykliczne ze stałym odstępem między zakończeniem poprzedniego uruchomienia `scheduledWithFixedDelay`.
Uruchamianie zadań ze stałym opóźnieniem (`scheduledAtFixedRate`) sprawia, że zadanie wykonuje się zawsze co określony interwał, na przykład co 10 sekund. Długość trwania jednego zadania nie ma wpływu na moment uruchomienia się drugiego. W praktyce może to wyglądać tak:
1. zadanie 1 - start: 00:00:00, czas trwania: 3s
2. zadanie 2 - start: 00:00:10, czas trwania: 1s
3. zadanie 3 - start: 00:00:20, czas trwania: 5s
4. zadanie 4 - start: 00:00:30, czas trwania: 7s
Z drugiej strony uruchamianie zadań ze stałym odstępem czasowym (`scheduledWithFixedDelay`) sprawia, że kolejne uruchomienie będzie miało miejsce gdy upłynie określony czas od _skończenia_ się poprzedniego uruchomienia. W tym wypadku będzie to wyglądać następująco:
1. zadanie 1 - start: 00:00:00, czas trwania: 3s
2. zadanie 2 - start: 00:00:13, czas trwania: 1s
3. zadanie 3 - start: 00:00:24, czas trwania: 5s
4. zadanie 4 - start: 00:00:39, czas trwania: 7s

## Skąd wziąć pule wątków?
Wszystko fajnie, ale skąd wziąć instancje tych pul wątków? Najprościej skorzystać z klasy `Exeutors` z pakietu `java.util.concurrent`, która jest fabryką pul wątków.

    public class Executors {
    
        public static ExecutorService newFixedThreadPool(int nThreads) { ... }
    
        public static ExecutorService newSingleThreadExecutor() { ... }
    
        public static ExecutorService newCachedThreadPool() { ... }
    
        public static ScheduledExecutorService newSingleThreadScheduledExecutor() { ... }
    
        public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) { ... }... }
    
        // ...
    
    }

## Do czego służy ThreadFactory?
Oprócz standardowych metod do tworzenia pul wątków w klasie `Executors` znajdziemy też analogicznie metody, które przyjmują dodatkowy argument `ThreadFactory`.

    public class Executors {
    
        public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) { ... }
    
        public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) { ... }
    
        public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) { ... }
    
        public static ScheduledExecutorService newSingleThreadScheduledExecutor(ThreadFactory threadFactory) { ... }
    
        public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize, ThreadFactory threadFactory) { ... }
    
        // ...
    
    
    }

Jak sama nazwa wskazuje `ThreadFactory` jest fabryką wątków dla puli wątków. Jest interfejsem i posiada jedną metodę `newThread`. Poprzez przekazanie własnej implementacji `ThreadFactory` możemy wyspecyfikować szczegóły nowo tworzonych wątków. Po co nam to potrzebne? Po to by na przykład ustalić nazwy nowych wątków, określić czy powinny być wątkami typu _daemon_, czy chociażby zająć się obsługą niezłapanych wyjątków (`thread.setUncaughtExceptionHandler`).

    ThreadFactory factory = new ThreadFactory() {
        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r);
            thread.setName("...");
            thread.setDaemon(true);
            thread.setUncaughtExceptionHandler(...);
            return thread;
        }
    };

## Co z obsługą wyjątków?
Do łapania wyjątków w ramach pul wątków, których nie obsługujemy w sposób jawny należy skorzystać z metody `thread.setUncaughtExceptionHandler`, którą możemy wyspecyfikować w ramach `ThreadFactory`. Poprzez implementację handlera niezłapanych wyjątków określamy co powinno się wtedy stać z wątkiem, z informacją o błędzie, i tak dalej.

    thread.setUncaughtExceptionHandler(
        new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread t, Throwable e) {
                // ...
            }
        }
    );

## Czy pula może przyjmować zadania w nieskończoność?
Nie. Aby dowiedzieć się dlaczego, spójrzmy dokładniej jak wygląda kod z fabryki `Executors` do utworzenia nowej puli wątków na przykładzie `newFixedThreadPool`.

    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(
          nThreads, // (1)
          nThreads, // (2)
          0L, // (3)
          TimeUnit.MILLISECONDS, // (4)
          new LinkedBlockingQueue<Runnable>() // (5)
        );
    }

Pod spodem tworzona jest instancja klasy `ThreadPoolExecutor`. Parametry 1 i 2 określają minimalną i maksymalną liczbę wątków w tej puli (jako że jest to pula "fixed", te liczby są takie same). Parametry 3 i 4 określają jak długo mają żyć wątki nadmiarowe, zanim zostaną ubite (w tym wypadku jest to 0, bo metoda dotyczy puli o stałej liczbie wątków). I parametr 5, który nas najbardziej interesuje - opisuje kolejkę, na którą trafiają kolejne zadania do wykonania - w tym wypadku jest to `LinkedBlockingQueue`. I teraz, gdy spojrzymy w kod tej kolejki zobaczymy tam taki konstruktor.

    /**
     * Creates a {@code LinkedBlockingQueue} with a capacity of
     * {@link Integer#MAX_VALUE}.
     */
    public LinkedBlockingQueue() {
        this(Integer.MAX_VALUE);
    }

Oznacza to, że kolejka przyjmie maksymalnie `2.147.483.647` zadań. Dość dużo, prawda? Warto pamiętać jednak o tym, że prawdopodobnie wcześniej skończy nam się pamięć na stercie (_heap_) i program zakończy swoje działanie z powodu `OutOfMemoryError`.
## Jak zatrzymać pulę wątków?
W typie `ExecutorsService` znajdziemy 5 metod, które pomogą nam ten cel osiągnąć.

    public interface ExecutorService extends Executor {
        void shutdown();
        boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException;
        List<Runnable> shutdownNow();
    
      boolean isShutdown();
      boolean isTerminated();
        // ...
    }

Sprawdźmy, do czego służą.
1. `shutdown()` - wysyła sygnał do puli wątków, by ta przestała przyjmować kolejne zadania do wykonania. Sprawia jednak, że wszystkie zadania, które były wysłane do tej pory będą normalnie czekać w kolejce na wykonanie się. Metoda nie blokuje wykonania kolejnych instrukcji kodu.
2. `awaitTermination()` - z kolei ta metoda sprawia, że wykonanie kodu blokuje się w oczekiwaniu na zakończenie wykonania wszystkich zadań. Metoda przyjmuje parametry `timeout`, po których przerywa swoje działanie, jeśli do tego czasu wszystkie zadania się nie wykonają. W tym wypadku kończy się to rzuceniem wyjątku `InterruptedException`.
3. `shutdownNow()` - w przeciwieństwie do metody `shutdown()` kończy działanie puli wątków natychmiast. Kolejne zadania nie będą przyjmowane na kolejkę, zadania oczekujące w kolejce zostaną zwrócone z metody (`List<Runnable>`), a zadania będące w trakcie wykonywania będą przerwane za pomocą `Thread.interrupt()`. Uwaga! Jeśli nie mają odpowiednio zaimplementowanej obsługi przerywania (`interrupt`), wówczas nadal mogą się wykonywać. Metoda `shutdownNow()` nie zatrzymuje wykonywania kolejnych instrukcji kodu, więc jeśli chcemy poczekać na zakończenie działania puli wątków ponownie musimy skorzystać z metody `awaitTermination()`.
Oprócz powyższych metod mamy do dyspozycji jeszcze 2 do sprawdzania stanu zamknięcia puli wątków:
1. `isShutdown()` - zwraca flagę `true`/`false` z informacją czy pula wątków została zamknięta,
2. `isTerminated()` - zwraca flagę `true` jeśli pula została zamknięta i wszystkie zadania już zakończyły swoją pracę, `false` w przeciwnym wypadku. Zwróć uwagę, że jeśli nie zawołano wcześniej `shutdown` lub `shutdownNow`, to ta metoda zawsze zwróci `false`.

## Jak anulować zadanie wysłane do puli wątków?
Nie jest to takie proste. Na przykład poniższy fragment nie sprawi, że zadanie przestanie się wykonywać.

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    Future<?> future = executorService.submit((Runnable) () -> {
        while(true) {
            System.out.println("Catch me if you can 👻");
            try {
                Thread.sleep(2_000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    });
    Thread.sleep(5_000);
    future.cancel(true);

Zadanie co 2 sekundy wypisuje napis na konsolę, a po 5 sekundach od startu próbujemy je zatrzymać metodą `Future#cancel`. Nic z tego. Aby zatrzymać zadanie z puli należy w warunku `while` sprawdzać flagę `Thread.currentThread.isInterrupted()` oraz w bloku `catch` w momencie wystąpienia wyjątku `InterruptedException` ustawić odpowiednio tę flagę.

    ExecutorService executorService = Executors.newSingleThreadExecutor();
    Future<?> future = executorService.submit(() -> {
        while(!Thread.currentThread().isInterrupted()) {
            System.out.println("Catch me if you can 👻");
            try {
                Thread.sleep(2_000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    });
    Thread.sleep(5_000);
    future.cancel(true);

W przypadku zadań, które nie zaczęły jeszcze swojej pracy na puli wątków musimy zatrzymać całą pulę - `shutdownNow()`. Inne rozwiązanie polega na własnej implementacji interfejsu `Runnable`, w którym eksponujemy samodzielnie zdefiniowaną metodę `cancel`, która sprawi, że zadanie w momencie trafienia do wykonania od razu zakończy swoją pracę bez podejmowania jakichkolwiek działań.
* * *

## Podsumowanie
Praca z wielowątkowością nie należy do najprostszych. Warto jednak wiedzieć, że jak wszystko jest kwestią zagłębienia się w dany temat. To co warto zapamiętać z tego wpisu to:
1. Tworzenie nowych wątków jest kosztowne. Lepiej korzystać z góry ustalonej puli wątków, która lepiej zarządza używanymi zasobami.
2. Java dostarcza nam 2 interfejsy: `Executor` i `ExecutorService` do pracy z pulami wątków oraz fabrykę `Executors` do wygodnego tworzenia nowych instancji pul wątków.
3. Do wykonywania zadań cyklicznie, lub z opóźnieniem czasowym służy inny interfejs: `ScheduledExecutorService`.
4. Za pomocą `ThreadFactory` możemy lepiej określić jak mają być tworzone nowe wątki w ramach `Executorów`.
5. Do łapania niezłapanych wyjątków służy metoda `thread.setUncaughtExceptionHandler`.
6. Pule wątków nie mogą przyjmować zadań w nieskończoność. Domyślna implementacja przyjmuje maksymalnie ponad 2 miliardy zadań, co wcześniej zapewne skończy się problemami z pamięcią. 
7. Możemy też sami zdefiniować ile zadań maksymalnie może trafić na pulę samodzielnie tworząc jej instancję i przekazując własną instancję kolejki na zadania.
8. Do zatrzymywania pul wątków służą metody `shutdown`, `shutdownNow()` i metoda pomocnicza `awaitTermination`.
9. Zatrzymanie działających zadań nie jest takie proste i wymaga poprawnego korzystania z flagi `interrupted`.

