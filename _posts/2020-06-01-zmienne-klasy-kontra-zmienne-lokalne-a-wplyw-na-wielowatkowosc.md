---
layout: post
title: Zmienne klasy kontra zmienne lokalne a wpływ na wielowątkowość ⚔️
description: 
image: /images/zmiennelokalne.png
tags: []
---

Jedną z najważniejszych rzeczy podczas tworzenia aplikacji webowych, jest upewnienie się, że będą one działać bezpiecznie przy dostępie wielowątkowym. Jednym z istotnych elementów, które należy wziąć pod uwagę, jest widoczność zmiennych. W tym wpisie tłumaczę, czym różnią się zmienne klasy od zmiennych metod w kontekście wielowątkowości.[sc name="webinar"] Weźmy pod uwagę poniższą klasę `Employee`. Mamy w niej do czynienia ze zmienną klasową `workedHours` oraz ze zmienną lokalną&nbsp;`hoursSum` w metodzie `yearlyHours`. W kontekście wielowątkowości obie te zmienne mają odmienną charakterystykę.

    class Employee {
    
        private Map<Long, Long> workedHours;
    
        public long yearlyHours() {
            long hoursSum = 0;
            for(long hours: workedHours.values()) {
                hoursSum += hours;
            }
            return hoursSum;
        }
    
        public void logHours(long month, long hours) {
            workedHours.set(month, workedHours.get(month) + hours);
        }
    
    }

Zmienna `workedHours` podlega dostępowi wielowątkowemu. W momencie, w którym wiele wątków na raz korzysta z tej samej instancji klasy Employee, może łatwo dojść do warunków wyścigu (ang. _race condition_), w wyniku którego dane zapisane w obiekcie wskazywanym przez tą zmienną będą niepoprawne. Z kolei zmienna `hoursSum` nigdy nie będzie widoczna dla wielu wątków jednocześnie. Każdy wątek wywołując metodę `yearlyHours` tworzy własną&nbsp;instancję i nie współdzieli jej z innymi wątkami.
## Co to dla mnie oznacza?
Konsekwencje są dwie. Po pierwsze, za każdym razem, kiedy tworzysz nowe zmienne w ciałach metod i nie udostępniasz ich nigdzie indziej, możesz nie przejmować się dostępem wielowątkowym. Takie zmienne są widoczne tylko i wyłącznie dla wątku, który je utworzył. Z kolei, gdy mówimy o zmiennych klasowych, wówczas musisz się upewnić, że podczas wielowątkowego dostępu nie będą one modyfikowane jednocześnie przez kilka wątków. Tym samym prowadząc do niepoprawnych danych.
## Co należy więc zrobić z powyższym fragmentem kodu?
Należy się upewnić, że mapa, na którą wskazuje `workedHours` może być bezpiecznie używana przez wiele wątków jednocześnie. Najprostsze rozwiązanie to otoczenie metody `logHours` klauzulą `synchronized`.

    class Employee {
    
        private Map<Long, Long> workedHours;
    
        public synchronized void logHours(long month, long hours) {
            workedHours.set(month, workedHours.get(month) + hours);
        }
    
    }

Należy wtedy pamiętać, by inne użycia tej zmiennej również opatrzyć takim słowem kluczowym. Oraz by nie udostępniać tej zmiennej na zewnątrz klasy! **Drugie rozwiązanie** polega natomiast w tym wypadku na **zastosowaniu implementacji mapy dedykowanej dostępowi współbieżnemu** , czyli `ConcurrentHashMap`. Wtedy metoda `logHours` mogłaby wyglądać tak:

    class Employee {
    
        private Map<Long, Long> workedHours = new ConcurrentHashMap<>();
    
        public void logHours(long month, long hours) {
            workedHours.compute(month, (key, current) -> current + hours);
        }
    
    }

Pozbywamy się słowa kluczowego `synchronized` a wewnętrzne mechanizmy klasy `ConcurrentHashMap` zapobiegają współbieżnemu dostępowi do wpisu pod kluczem `month`.
## Co powinienem z tego zapamiętać?

1. Zmienne klasy i zmienne w metodach mają odmienną charakterystykę pod kątem dostępu wielowątkowego.
2. Zmienne klasy mogą być odczytywane i modyfikowane przez wiele wątków naraz, dlatego należy zadbać o ich odpowiednie zabezpieczenie
3. Zmienne tworzone w metodach są widoczne tylko dla wątku, które je stworzył. Dlatego nie trzeba martwić się synchronizacją przy dostępie do nich.
4. Referencje do zmiennych klasy znajdują się na stercie (_heap_), a referencje do zmiennych metod znajdują się na stosie (_stack_) aktualnie wykonującego się wątku.

