---
layout: post
title: Jak Either pomoże Ci pisać lepszy kod - niezależnie w jakim języku programowania piszesz!
description: 
image: https://dummyimage.com/1500x1000/fff/aaa
tags: []
---

Wykonanie metod w programach może bardzo często zakończyć się na jeden z dwóch sposób. Pierwszy - sukcesem. Operacja kończy się poprawnie, dane wejściowe są w porządku, warunki wykonania algorytmu są prawidłowe, można zwrócić wynik do wołającego. Są też jednak sytuacje, gdy zawołana metoda nie może zostać wykonana.Dany użytkownik nie ma uprawnień, zamówienie nie może zostać zrealizowane, wprowadzone zostały niepoprawne dane. Co wtedy zrobić? Częstym sposobem radzenia sobie z taką sytuacją przez programistów jest rzucanie wyjątkami. Niestety ma to swoje minusy. Wyjątki zaśmiecają kod. Zobaczmy na przykładową metodę.

    public Order placeOrder(OrderCommand command) throws OutOfStockException {
        if(inventory.isAvailable(command.productId(), command.quantity())) {
            throw new OutOfStockException(command.productId(), command.quantity());
        }
        if(...) {
            ...
        }
        return order;
    }

Powyższa metoda musi zadeklarować jaki wyjątek rzuca. Co więcej, gdy powodów, dla których operacja biznesowa może się nie udać potrzebne będą kolejne wyjątki. Wtedy metoda musi zadeklarować je wszystkie, wyciągnąć je do wspólnej klasy bazowej lub po prostu deklarować, że rzuca nic nie mówiący `Exception`. Z kolei, gdy zamienimy typ wyjątku na `unchecked` to, co prawda upraszczamy sygnaturę metody, ale z kolei wołający metodę `placeOrder` traci informację, że coś może pójść nie tak i może pomyłkowo założyć, że ta operacja biznesowa zawsze się uda. W żaden sposób nie zabezpieczy się przed potencjalnymi problemami.
## Wtedy wchodzi Either - cały na biało
Świetnym sposobem rozwiązania tego problemu może być zastosowanie typu `Either` pochodzącego ze świata funkcyjnego! Jak to wygląda? Zobaczmy na poniższy fragment.

    public Either<Error, Order> placeOrder(PlaceOrderCommand command) {
        if(inventory.isAvailable(command.productId(), command.quantity())) {
            return Either.left(Error.of("OUT_OF_STOCK_EXCEPTION"))
        }
        if(...) {
            ...
        }
        return Either.right(order);
    }

Tym razem nie rzucamy żadnym wyjątkiem, metoda jasno deklaruje, że może zakończyć się zarówno sukcesem jak i błędem, a w przypadku większej ilości problemów nie powoduje zwiększenia liczby deklarowanych błędów.

> Klasa `Error` jest przykładową klasą podaną w powyższym fragmencie. To jak będzie ona wyglądać i jakiego będzie typu w pełni zależy od Ciebie i Twoich ustaleń z zespołem.

## Jak działa Either?
`Either` to klasa deklarująca dwie wartości. Lewa - błąd. Prawa - sukces. To wszystko. Samą klasę `Either` możesz znaleźć w bibliotece [Vavr](https://www.vavr.io/). Lub przygotować własną uproszczoną implementację. Na przykład taką.

    public class Either<E, S> {
        private final E error;
        private final S success;
    
        public static <E, S> Either<E, S> error(E error) {
            return new Either<>(error, null);
        }
    
        public static <E, S> Either<E, S> success(E, S success) {
            return new Either<>(null, success);
        }
    
        public <T> T handle(Function<S, T> onSuccess, Function<E, T> onError) {
            if(success != null) {
                return onSuccess.apply(success);
            } else {
                return onError.apply(error);
            }
        }
    }

Jak widzisz klasa jest generyczna i może przyjmować wybrane przez Ciebie typy zarówno do oznaczenia błędu jak i sukcesu wykonania danej metody. To co jest w niej eleganckie, to późniejsza obsługa wyniku z takiej metody. Może to wyglądać następująco.

    @PostMapping
    public ReponseEntity<?> placeOrder(PlaceOrderCommand command) {
        return orderService.placeOrder(command)
            .handle(
                success -> ReponseEntity.ok(success),
                error -> new ReponseEntity(error.message(), error.code())
            );
    }

Eleganckie, funkcyjnie skonsumowanie wyniku.

> Na początek swojej przygody możesz wystartować z uproszczoną propozycją implementacji klasy `Either` zaprezentowaną w tym artykule. W przyszłości, gdy będziesz potrzebował lepszej implementacji możesz zaznajomić się z propozycją z biblioteki Vavr.

## Jeśli chcesz poprawić sposób obsługi błędów w aplikacji zacznij stosować Either
Wyjątki zostawmy sytuacjom wyjątkowym. Z których nie ma ratunku. Jak utracone połączenie do bazy danych, przepełniona pamięć, czy brak miejsca na dysku. Operacje biznesowe niech mają swoją semantykę i niech informują wprost jeśli mogą pojawić się problemy z ich wykonaniem.
## Podsumowanie

1. Metody biznesowe powinny sygnalizować, że nie zawsze mogą zakończyć się sukcesem.
2. Opieranie się w tej sytuacji na rzucaniu wyjątków może prowadzić do zaciemnienia kodu i obniżyć czytelność danych metod.
3. Dobrym rozwiązaniem tego problemu jest zastosowanie typu `Either` pochodzącego z programowania funkcyjnego.
4. Możesz w tym celu skorzystać z uproszczonej własnej implementacji lub sięgnąć do gotowej z bibliotece Vavr.
5. Popraw czytelność swojego kodu stosując typ `Either`. Tak jak `Optional` zwraca większą&nbsp;uwagę na możliwość braku wartości tak `Either` zwraca uwagę na potencjalne błędy przy wołaniu metod biznesowych.
6. Tym samym zwiększasz jakość swojego kodu minimalizując przeoczenie błędów przez programistów.
7. Powodzenia!

