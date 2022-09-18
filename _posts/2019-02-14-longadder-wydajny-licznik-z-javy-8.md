---
layout: post
title: LongAdder - wydajny licznik z Javy 8
description: 
image: /images/1500x1000.png
tags: [współbieżność, wielowątkowość, wątki]
---

Niedawno trafiłem na ciekawą strukturę z Javy 8 - `LongAdder`. 

Okazało się, że w niektórych przypadkach jest dużo lepszym wyborem niż `AtomicLong`. 

Dlaczego? Zapraszam do wspólnej podróży.Do tej pory zawsze używałem klas z grupy `Atomic` - były bezpieczne wielowątkowo, korzystały z operacji `compare-and-swap` i miały być wydajne. 

Okazuje się, że dzięki zastosowaniu pewnego tricku `LongAdder` potrafi być nawet 6 razy wydajniejszy!

## O co chodzi?

Klasy z rodziny `AtomicLong` używają instrukcji procesora compare-and-swap do aktualizowania wartości. 

Jest to bardzo wydajny mechanizm wykorzystujący bezpośrednio instrukcje maszynowe procesora do ustawienia wartości z minimalnym efektem na wykonywanie się innych wątków. 

Z minimalnym, nie oznacza z żadnym. 

Pod dużym obciążeniem wątek będzie nieustannie próbował zapisać wartość w nieskończonej pętli aż do momentu, gdy mu się to uda. 

Oznacza to, że w sytuacji gdy wiele wątków stara się pisać w jednym czasie do zmiennej typu `AtomicLong` prowadzi to do [spinlocków](https://pl.wikipedia.org/wiki/Spinlock) i spadków wydajności.

## LongAdder na ratunek

`LongAdder` korzysta z pewnej optymalizacji, dzięki której obcy jest mu powyższy problem. 

Zamiast zapisywać zmiany wartości do jednego miejsca, zapisuje je do wielu miejsc. 

Dzięki temu nie ma sytuacji, w której wiele wątków konkuruje o dostęp do zapisu w to samo miejsce. 

W ten sposób wydajność zdecydowanie wzrasta. 

[caption id="attachment\_324" align="aligncenter" width="300"] ![](https://strony.sztukakodu.pl/wp-content/uploads/2019/02/longadder-1-300x288.jpg) W AtomicLongu wiele wątków stara się modyfikować ten sam obszar pamięci[/caption] [caption id="attachment\_325" align="aligncenter" width="300"] ![](https://strony.sztukakodu.pl/wp-content/uploads/2019/02/longadder-2-300x300.jpg) W LongAdderze wątki piszą do różnych obszarów pamięci[/caption] Ta struktura ma jednak też swoje minusy. 

O ile zapisywanie jest bardzo wydajne - `O(1)` - o tyle odczyt wymaga już wykonywania operacji sumowania wszystkich wartości. 

Algorytm musi przeiterować przez wszystkie liczby z pól tablicy, które były użyte w LongAdderze - to daje nam wydajność rzędu `O(n)`. 

Co więcej, operacja odczytu niekoniecznie będzie dokładna. 

Jeśli w tym samym momencie ktoś będzie próbował pisać do LongAddera, spowoduje to pominięcie nowej wartości w obliczeniach. 

Zarówno zapis jak i odczyt są więc operacjami nieblokującymi. 

Daje to bardzo wysoką wydajność, ale też nie przychodzi bez innych kosztów - w tym wypadku dokładności. 

Co to oznacza? `LongAdder` najlepiej sprawdza się w sytuacji, w której liczba zapisów zdecydowanie przekracza liczbę odczytów. 

I w której nie zależy nam na każdorazowej dokładności odczytanych wyników. 

Zbieranie statystyk, metryk i tym podobnych wielkości będzie idealnym zastosowaniem tej klasy.

## Testy

Aby to potwierdzić wykonałem [dwa testy](https://gist.github.com/dmydlarz/ec4bae1b1dbb3e105ee4acc06e32e1ac). 

Jeden, w którym na 1000 zapisów wartości przypada 1 odczyt i drugi, w którym przy każdym zapisie odczytujemy aktualną wartość. 

Test uruchomiłem na 100 wątkach, na dwurdzeniowym procesorze Intel Core i5. Oto wyniki (im więcej, tym lepiej): 100 wątków, odczyt wartości co 1000 iteracji:
- `AtomicLong` - 39.927 operacji na sekundę
- `LongAdder` - 232.363 operacji na sekundę (5,82 raza więcej)
100 wątków, odczyt wartości przy każdej iteracji:
- `AtomicLong` - 37.728 operacji na sekundę
- `LongAdder` - 42.800 operacji na sekundę (1,13 raza więcej)
W pierwszym wypadku `LongAdder` był wydajniejszy 5,82 raza, a w drugim o 1,13. Widać więc jego przewagę nad `AtomicLongiem` i to, że najlepsze rezultaty osiąga przy częstych zapisach i rzadkich odczytach.

# Podsumowanie

`LongAdder` to jedna z czterech klas jednej rodziny wprowadzonych do Javy 8 w ramach [usprawnień](https://docs.oracle.com/javase/8/docs/technotes/guides/concurrency/changes8.html) dotyczących współbieżności. 

Jeśli będziesz potrzebował wydajnego licznika bezpiecznego wielowątkowo od teraz powinieneś preferować te klasy, zamiast klas typu `Atomic`.
