---
layout: post
title: Metryki, GŁUPCZE!
description: 
image: /images/metryki.jpg
tags: [metryki, observability, monitoring]
---

Jaki jest warunek niezawodności systemu na produkcji? No jak to jaki? 100% pokrycia kodu testami! No raczej nie ¯\_(ツ)\_/¯ . Nawet najlepiej przetestowane oprogramowanie może powodować błędy. W takim razie, co robić? Zapraszam, to się dowiesz!Też przechodziłeś te same etapy dotyczące testowania i jakości oprogramowania co ja? Jak to było? To może po kolei.

1. Po co te testy, przecież ja piszę działający kod.
2. O nawet spoko te testy, mogę szybciej weryfikować czy to co robię działa.
3. Kur.. Czemu w tym projekcie nie ma testów?!
4. Każda biznesowa zmiana musi zaczynać się od testów.
5. Każdy nowy bug musi być pokryty testem.
6. Każda wartość biznesowa musi być pokryta testem.
W końcu dochodzisz do wniosku, że testy są super i że dzięki nim sprawisz, że Twoje oprogramowanie będzie niezawodne na produkcji. Wszystko fajnie i ładnie, ale...
1. Czy na swoim środowisku programistcznym pracujesz na takiej samej ilości danych co na produkcji?
2. Czy korzystasz z tak samo skonfigurowanej bazy danych? Działającej na tej samej liczbie instancji, obsługującej taką samą liczbę połączeń, użytkowników?
3. Czy lokalnie z Twojego systemu korzysta tyle samo użytkowników jednocześnie, co na produkcji?
4. Czy Twoja aplikacja będzie uruchomiona na tym samym systemie operacyjnym, tym samym środowisku, tych samych ustawieniach, zmiennych środowiskowych? 
5. Czy Twoja aplikacja będzie zlokalizowana geograficznie w tym samym miejscu, co jej użytkownicy? Ile będzie miała instancji?
6. Co się stanie, gdy aplikacja utraci połączenie do bazy danych?
7. Co się stanie, gdy aplikacja nie uzyska połączenia do bazy danych na starcie?
8. Co się dzieje z logami z aplikacji? Gdzie są zapisywane? I co się stanie, gdy na dysku z logami zacznie brakować miejsca?
9. Co się stanie, gdy Twoja aplikacja zacznie nadużywać pamięci RAM i procesora?
10. Co się stanie, gdy Twoja konkurencja zacznie atakować Twoją aplikację generując sztuczny ruch?
I tak dalej, i tak dalej... Takich pytań można stawiać by jeszcze dziesiątki. Co chcę przez to powiedzieć? A no to, że tworzenie oprogramowania na środowisku developerskim, w "cieplarnianych" warunkach, pod kocykiem przy Twoim ulubionym biurku i ergonomicznej klawiaturze, a uruchamianie go na produkcji i utrzymanie przy życiu to zupełnie dwa inne światy. Jeśli do tej pory Twoja rola kończyła się na implementacji wymagań i napisaniu nawet najlepszych testów, to może Ci się wydawać, że to co tworzysz jest _bullet-proof_. I po części masz rację. Wydaje Ci się. Liczba problemów związanych z działaniem aplikacji na produkcji rośnie wraz z liczbą elementów, z którymi mamy do czynienia. System operacyjny, wersje bibliotek, środowisko uruchomieniowe, wolumen danych i użytkowniów, ruch zewnętrzny, problemy z siecią, liczba logów i tak dalej mogą prowadzić do błędów, których nie sposób odtworzyć na środowisku programistycznym. I choć wiele osób będzie się zarzekać i próbować symulować podobne zachowania na niższych środowiskach developerskich, nigdy nie uda się odtworzyć produkcji w 100%.
## W takim razie co robić? Jak żyć?
Jeśli chcesz być pewien, czy Twoja aplikacja działa poprawnie na produkcji musisz zacząć ją obserwować. I nie chodzi o to, żeby po każdym wdrożeniu po niej ręcznie klikać i sprawdzać, że wszystko jest ok. Nie chodzi też o to, żeby dodać masę logów i patrzeć się w nie w poszukiwaniu błędów. Chodzi o to, żeby do swojego systemu dodać... metryki! Jakie? Na przykład:
1. liczba połączeń do Twojej aplikacji,
2. statusy odpowiedzi,
3. czasy odpowiedzi,
4. liczba i stan wątków,
5. zużycie procesora, pamięci RAM i dysku,
6. liczba obiektów biznesowych,
7. liczba, statusy i czasy odpowiedzi z zewnętrznych serwisów, 
8. praca garbage collectora,
9. liczba błędów - błędnych odpowiedzi HTTP, rzuconych wyjątków, zalogowanych wyjątkow.
Dzięki odpowiedniemu mierzeniu i obserwowaniu metryk Twój system będzie w stanie **automatycznie (!)** poinformować Cię o tym, że coś przestało działać. Liczba błędnych odpowiedzi wzrosła po ostatnim wdrożeniu? Pewnie pojawił się jakiś niespodziewany bug. Zewnętrzny serwis zaczął zwracać błędy? Być może ma problemy i przestał odpowiadać. Odśmiecanie pamięci powoduje ciągłe pauzy i nie zwalnia wiele zasobów - widocznie masz do czynienia z wyciekiem. Liczba biznesowych obiektów przestała rosnąć zgodnie z oczekiwaniami - prawdopodobnie jest jakiś błąd, który bezpośrednio powoduje problemy u użytkowników. Mając takie metryki możesz zdecydowanie szybciej reagować na problemy w swojej aplikacji, których nie dało się wykryć nawet przy zastosowaniu najlepszych procesów testerskich na etapie wprowadzania zmiany do systemu. Oczywiście nikt będzie budował metryk po to, żeby w nie patrzeć 24h / dobę. Oprócz nich potrzebujesz systemu alertującego, który będzie informował Cię o zwiększonej liczbie błędów, o problemach z połączeniami, o nienormalej pracy garbage collectora, czy nadmiernym zużyciu procesora, dysku czy RAM-u. Ale pomyśl o ile lepiej, by to system Cię informował zamiast Twoi użytkownicy.
## Zapamiętaj

1. O ile testy w Twojej aplikacji są niezwykle ważne, o tyle nie zapewniają 100% niezawodności Twojego systemu.
2. Aplikacje działające na produkcji pracują w zupełnie innych warunkach niż na Twoim środowisku programistycznym, czy nawet najlepszym środowisku przed-produkcyjnym.
3. Produkcja zawsze będzie różniła się ilością danych, liczbą użytkowników, tempem połączeń, czy parametrami maszyny, na której jest uruchomiona.
4. Jedyny sposób na to by być pewnym, czy Twoja aplikacja działa poprawnie na produkcji to dodanie do niej metryk, obserwowanie ich i włączenie powiadomień w sytuacjach anomalii.
5. Takie rozwiązanie pomoże Ci szybciej reagować na błędy i poprawić zadowolenie użytkowników z korzystania z Twojej aplikacji.
A jak to wszystko mierzyć w Javie i Springu? Zostaw komentarz, jeśli chcesz się dowiedzieć - wówczas napiszę kolejny artykuł poświęcony konkretnym narzędziom i bibliotekom ;)
