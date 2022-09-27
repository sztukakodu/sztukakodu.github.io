---
layout: post
title: 15 Zasad Przy Budowie REST API, Za Które Deweloperzy Cię Pokochają 🥰
description: 
image: /images/15rest.png
tags: [spring, rest, api]
---

Kiedy pierwszy raz spotkałem się z REST API od razu je pokochałem. Czysty, czytelny sposób komunikacji między usługami z jasno określonymi zasadami. Nic dziwnego, że od jakiegoś już czasu jest to najchętniej wybierane rozwiązanie przez deweloperów aplikacji webowych, czy mobilnych. W tym wpisie prezentuję Ci 15 zasad, dzięki którym zbudujesz REST API, za które deweloperzy Cię pokochają.

## 1. Stosuj rzeczowniki w adresach
Adresy w API REST-owym powinny być RZECZOWNIKAMI - wskazywać na konkretne zasoby, do których chcesz się dostać. Na przykład:

```
/books
/books/once-upon-a-time-in-a-hollywod
/books/831231201
/cars/audi/a4/b6/2009/diesel/2.0
/invoices/google-analytics/2019/03/12/151
```

W REST API nie stosuje się czasowników i wszystkie tego rodzaju adresy są błędne, jak na przykład:

```
/getBooks
/books/once-upon-a-time-in-a-hollywod/update/status
/invoices/google-analytics/2019/03/12/151/markAsPaid
```

Dzięki stosowaniu hierarchicznej struktury obiektów i prostej - RZECZOWNIKOWEJ - adresacji zasobów API budowane za pomocą REST-a jest dużo bardziej intuicyjne, skalowalne i prostsze w obsłudze przez wszystkich zainteresowanych.

## 2. Używaj metod zgodnie z przeznaczeniem
REST opiera się na wzorcach wypracowanych w protokole HTTP. Dlatego korzysta z metod znanych z HTTP.

Jeśli Twoja aplikacja udostępnia jedynie metody GET i POST to znak, że nie do końca poprawnie implementujesz komunikację REST-ową.

Jak więc powinno wyglądać to w rzeczywistości? Pokażę na przykładach.

1. `GET /books` - pobiera listę książek,
2. `POST /invoices/google-analytics` - dodaje fakturę,
3. `PUT /books/once-upon-a-time-in-a-hollywod` - nadpisuje konkretną książkę,
4. `PATCH /books/831231201` - aktualizuje konkretną książkę,
5. `DELETE /invoices/google-analytics/2019/03/12/151` - usuwa fakturę z danej ścieżki,
6. `HEAD /cars/audi/a4/b6/2009/diesel/2.0` - zwraca informację czy dany zasób istnieje (bez przesyłania treści zasobu)
7. `OPTIONS /books` - zwraca listę metod, które są dostępne na danym zasobie.

Przy wykorzystaniu powyższych metod, oraz odpowiedniej adresacji zasobów (patrz punkt 1) jesteśmy w stanie wykonać wszystkie operacje na obiektach aplikacji bez potrzeby tworzenia potworków w stylu `/offer/321312/markAsExpired`, w których *niepoprawnie* korzystamy z czasowników.

## 3. Zapoznaj się ze statusami i ZAWSZE z nich korzystaj.
Protokół HTTP, na którym opiera się REST, to nie tylko adresy i metody - ale także kody statusów. Tych jest ponad 50. Ich największą zaletą jest to, że są ustandaryzowane i wszędzie znaczą to samo. Dzięki temu komunikując się z dowolną usługą REST-ową od razu wiesz, co dana informacja oznacza. 

Ważne by projektując własne API REST-owe korzystać z tych kodów i zwracać te najbardziej odpowiadające zdarzeniu.
Ja najczęściej korzystam ze strony [httpstatuses.com](https://httpstatuses.com) aby podglądać, który status powinienem użyć.

Zajrzyj na nią, gdy następny raz będziesz się zastanawiać czy stosować kod 200, 201 a może 204.

## 4. Zwracaj dane w kopercie
Serwisy REST-owe, odróżnia od serwisów SOAP-owych brak modelu kanonicznego - innymi słowy - narzuconej i wymaganej struktury danych. Z jednej strony jest to zaleta - bo daje dużą elastyczność, a z drugiej problem, bo nie możemy łatwo zdefiniować kontraktu, według którego powinny być przesyłane dane. 

Niezależnie od tego jaką strukturę danych przyjmiesz pamiętaj o tym, by zawsze przesyłać je w kopercie jak poniżej.

Pole `data` w przypadku poprawnej odpowiedzi.

```json
{
    "data": []
}
```

Oraz pole `error` w przypadku błędów.

```json
{
    "error": {
        "code": "",
        "message": "",
        "details": ""
    }
}
```


## 5. Zwracaj wartościowe odpowiedzi błędów
Gdy coś w komunikacji z twoim API poszło nie tak staraj się zwracać szczegółowe informacje. Wiadomość `Oops, something went wrong` może nie być najlepszym pomysłem ;) Stosuj kopertę z punktu 4 i umieszczaj w niej takie informacje jak:

* `code` - wewnętrzny kod błędu Twojej aplikacji, który pozwoli Ci zidentyfikować problem,
* `msg` - wiadomość tekstowa dotycząca błędu,
* `details` - opcjonalnie informacje ze szczegółami danego problemu.

Jak może wyglądać taka wiadomość? Na przykład:

```json
{
    "error": {
        "code": "SK30",
        "message": "Insufficient account balance",
        "details": "Unable to transfer 100 PLN. Not enough funds on the account"
    }
}
```


## 6. Stosuj paginację...
Masz endpoint do zwracania listy obiektów, na przykład książek w sklepie internetowym. Zwracasz więc wszystkie obiekty. A co jeśli obiektów nie jest 20, a 200? Jeszcze powinno być ok. A 2 tysiące? Albo… 2 miliony?

Za każdym razem stosuj paginację i zwracaj tylko podzbiór wszystkich obiektów. Podziękują Ci za to klienci, frontendowcy oraz szef… który będzie płacił mniejsze rachunki za serwery backendowe.

## 7. ...ale rób to MĄDRZE!
Standardowa metoda paginacji opiera się na parze: `FROM` i `SIZE`. Przeglądasz więc zasoby z backendu wykonując kolejno zapytania:

1. `from=0, size=10`
2. `from=10, size=10`
3. `from=20, size=10`
4. `from=30, size=10`
5. `from=40, size=10`

I tak dalej. Co jeśli między zapytaniem 3 i 4 doszedł nowy obiekt do systemu? A co jeśli jakiś obiekt został z niego usunięty? W Twoich wynikach pojawi się niespójność.

Zamiast tego sortuj zawsze obiekty według stałych atrybutów - na przykład `ID` a w trakcie paginacji stosuj raczej parametry:

1. `size=10`
2. `greaterThanOrEqual=<LAST_ITEM_ID> size=10`
3. `greaterThanOrEqual=<LAST_ITEM_ID_PAGE_2> size=10`
4. `greaterThanOrEqual=<LAST_ITEM_ID_PAGE_3> size=10`

Wstawiając do pola `greaterThanOrEqual` ostatnie ID obiektu ostatnio zwróconego z backendu.

## 8. Wersjonuj API
Gdy wprowadzasz łamiące zmiany ;) (ang. `breaking changes`) do swojego API nigdy nie rób tego na opublikowanych już endpointach. Wspieraj stare API a nowe wprowadź obok już istniejące.

Z czasem możesz też monitorować użycie starego API i z chwilą zaniku jego używania dopiero je usunąć.

## 9. Wystaw Open API
Jeśli budując API na bieżąco współpracujesz z jego klientami warto wystawić Open API. Jest to specjalny plik w formacie YML, który dokładnie opisuje jakie endpointy wystawia Twoje API. Z jego pomocą integracja staję się dużo łatwiejsza. W językach JVM-owym uzyskasz Open API poprzez użycie [Swaggera](https://swagger.io).

Przykłady opublikowanych API znajdziesz zaś pod linkiem [https://app.swaggerhub.com/search](https://app.swaggerhub.com/search)

## 10. Wystaw skomplikowane filtrowanie jako osobny search endpoint
Jeśli potrzebujesz przefiltrować wyniki zwracane przez API możesz dodać zwykły parametr zapytania, na przykład:

```
GET /books?title=Nad+niemnem
```

Co zrobi jeśli jednak chcesz przeszukać więcej parametrów jak na przykład: gatunek literacki, narodowość autora, liczba pozytywnych opinii, dostępność w sklepach internetowych, i tak dalej?

Wystaw specjalny endpoint - `_search` do przeszukiwania swoich zasobów. Potraktuj go jako specjalny dodatkowy zasób. Przykładowe zapytanie może wtedy wyglądać tak:

```
POST /books/_search

{
  "genre": "lyric",
  "country": "Netherlands",
  "era": "renaissance",
  "rating": 4.5
}
```

## 11. Aktualizuj obiekty z metodą PATCH
Do aktualizacji zasobu służą dwie metody - `PUT` i `PATCH`. Czym się różnią? `PUT` - powinno nadpisywać cały obiekt, a `PATCH` nadpisywać tylko wysyłane atrybuty.

Poniższe żądanie powinno nadpisać tylko tytuł książki.

```
PATCH /books/134

{
    "title": "Nad Niemnem"
}
```

Natomiast `PUT` nadpisze całą treść pod podanym zasobem.

## 12. Pamiętaj, że GET nie powinien przesyłać payloadu
Zauważyłeś może jakiej metody HTTP użyłem w punkcie 9 przy definicji endpointu `_search`? Tak - `POST`. Chociaż wydawałoby się, że powinien być `GET`.

Z tą metodą jest jeden problem. Z definicji nie powinna ona zawierać żadnego *payloadu*. I chociaż część aplikacji i usług pośredniczących je akceptuje - to nie wszystkie muszą to robić.

Może się zdarzyć tak, że jedna składowa całego ciągu wywołań pominie przesłanie treści żądania `GET` i serwer nie otrzyma Twojego zapytania - tym samym zwróci Ci tylko podstawowe dane umieszczone pod żądanym zasobem.

## 13. Pamiętaj, że POST zawsze tworzy nowy obiekt
Metody `POST` używaj zawsze do tworzenia nowych obiektów. To znaczy:

* `POST /books` - utworzy książkę w systemie,
* `POST /books/123/comment` - doda komentarz do książki

i tak dalej. Nawet jeśli zdarzy Ci się przesłać pole `id` w treści żądania - w przypadku `POST`-a może ono być swobodnie pominięte przez serwer, który i tak utworzy nowy zasób.

## 14. Pamiętaj, że PUT, DELETE i PATCH powinny być IDEMPOTENTNE
Gdy wysyłasz żądania modyfikujące REST-em zawsze przesyłaj stan, a nie żądanie. Każde wywołanie REST-owego API powinno być idempotente - to znaczy, zmienić dany zasób maksymalnie jeden raz - nawet wykonane wielokrotnie.

Dlatego takie żądanie ma sens:

```
PATCH /games/ships/turn
{
  "field": "A3"
}
```

A takie nie:

```
PUT /stats/counter

{
    "incrementBy": 1
}
```

Gdy z powodu problemów na sieci żądanie numer dwa będzie ponowione, wówczas otrzymamy niepoprawny stan naszego systemu.

## 15. Korzystaj z nagłówków do wysyłania meta-danych
Jeśli potrzebujesz wysłać jakieś meta-dane do dostawcy API nie rozszerzaj obiektu, który wysyłasz. Zamiast tego skorzystaj z nagłówków HTTP i tam umieść informacje służące do uwierzytelnienia, włączenia specjalnych flag czy przesłania danych diagnostycznych. Treść żądań pozostaw czystym. 

Pamiętaj też o punkcie 11 - `GET` nie powinien mieć treści. W jego przypadku MUSISZ wysłać metadane w nagłówkach. Więc i tak nie masz wyboru :) 

## 16. BONUS - Korzystaj z testów kontraktowych w Springu
Teraz coś stricte ze [Springa](/webinar).

Co zrobić żeby upewnić się, że API wystawiane przez naszego dostawcę działa tak jakbyśmy się spodziewali? Wystarczy napisać testy.

Ale! Nie chodzi o testy, w których sami definiujemy jak działa API dostawcy, ale takie w których on sam udostępnia nam specjalną bibliotekę, która jest 100% kompatybilna ze stanem faktycznym.

Służą do tego testy kontraktowe, które w [Springu](/spring) możemy pisać przy pomocy Spring Cloud Contract. Prezentacja pokazująca jego możliwości znajdziecie [tutaj](https://www.youtube.com/watch?v=MDydAqL4mYE).

## Podsumowanie
Uf, to by było na tyle. Mam nadzieję, że ta dawka informacji pomoże Ci rozwijać swoje REST-owe serwisy.

Dzięki za wszystko!
