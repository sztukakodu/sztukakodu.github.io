---
layout:	post
title: Testy Eksploracyjne - ostatni etap przed releasem
description: 
image: /images/exploratory.png
tags: [testowanie, produkcja, najlepsze-praktyki]
---

Gdy długi projekt zbliża się ku końcowi wszyscy uczestnicy chcą w końcu mieć wdrożenie na produkcję za sobą.

Sesje architektoniczne, planowanie API, implementacja i dogłębne testowanie jest już za nimi.

Niestety mimo wszelkiego wysiłku często zdarza się, że na produkcji i tak pojawiają się niechciane bugi 🐛.

I o ile nigdy nie zapewnimy 100% bezbłędnego oprogramowania, o tyle zawsze możemy do tego dążyć.

Techniką, którą lubię stosować w takiej sytacji są...

## Testy Eksploracyjne

W okresie wytwarzania oprogramowania, dodawania nowej funkcjonalności do produktu czy rozszerzania go, każda rola ma tendecję do skupiania się na swoim ogródku.

Frontendowcy tworzą testy frontendu, backendowcy backendu, a testerzy szerokie testy spinające całość ze sobą.

Mimo to, może zdarzyć się, że przy określonych warunkach pojawiają się błędy, niespójności czy tzw. *edge case-y*.

Aby temu zapobiec możesz zastosować technikę **testów eksploracyjnych**.

Ale... w szczególnym wydaniu.

## Testy Ekspolracyjne Całego Zespołu

Zamiast znowu polegać na pracy 1-2 osób zespołu, wciągasz do zadania WSZYSTKIE osoby zainteresowane projektem.

Frontendowycy, backendowcy, testerzy, designerzy, produkt menadżerowie i wszyscy inni którzy mają jakąkolwiek styczność z projektem.

I zamiast kazać każdej z tej osób przeprowadzić testy na włąsną rękę, przygotowujecie scenariusze do przetestowania.

Wtedy w te 5-10 osób spotykacie się razem na wspólnej sesji trwającej od 1 do 2 godzin.

W tym czasie każda z tych osób stara pokryć się jak najwięcej przypadków testowych.

Jednocześnie stara się "popsuć" i znaleźć warunki brzegowe oprogramowania.

## Ale to nie wszystko!

Aby zajęcie miało jeszcze więcej sensu uczestnicy spotkania testują w różnej konfiguracji.

Na Windowsie, Linuxie, Macu, tablecie, w różnych przeglądarkach, itd.

Każdy stara się maksymalnie wykorzystać przeznaczony czas i znaleźć jak najwięcej bugów.

## Każdy błąd jest zapisywany

W formie ticketu w Jirze albo innej, która jest dla Was wygodna.

Nie przejmujcie się duplikatami.

Podczas późniejszego przeglądu zapisanych spraw duplikaty zostaną zidentyfikowane i odrzucone.

## Jeśli braknie Wam czasu

Możecie umówić się na drugą sesję.

Tym razem możecie zebrać już np. mniejszą grupę osób, gdyż te najbardziej rzucające się w oczy bugi zebraliście podczas pierwszej sesji.

Gdy tym razem nie znajdziecie już żadnych problemów, możecie z większą pewnością wdrażać projekt na produkcję.

## Nie oszukujcie się jednak...

100% błędów na pewno nie znajdziecie.

I nie traćcie czasu na próbę znalezienia wszystkiego.

Jeśli przez dłuższy czas nie możecie już nic wykryć, czas zakończyć sesję.

## Sesja weryfikacyjna

Po naprawie znalezionych błędów w dużo mniejszym gronie możecie jeszcze raz zweryfikować, że teraz wszystko działa jak należy.

Jeśli jest OK, możecie wdrażać projekt na produkcję.

# A Ty, stosujesz w swojej pracy testy eksploracyjne?

Daj znać w komentarzu poniżej.