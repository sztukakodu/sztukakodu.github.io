---
layout: post
title: Porozmawiajmy o wątkach
description: Jak to jest możliwe, że Twój komputer potrafi jednocześnie grać muzykę, odtwarzać film na Youtube, pobierać pliki czy odbierać pocztę? 
image: /images/watki.jpg
tags: [współbieżność, wielowątkowość, java, wątki]
---

Jak to jest możliwe, że Twój komputer potrafi jednocześnie grać muzykę, odtwarzać film na Youtube, pobierać pliki czy odbierać pocztę? 

To zasługa wątków i szybkiego przełączania się procesora, który je wykonuje.

Programy wykonywane na komputerze potrzebują różnych zasobów - dostępu do dysku, do pamięci RAM, do danych sieciowych, do drukarki, czy do procesora.

Procesor wykonuje kolejne instrukcje kodu Twojego programu.

W momencie, w którym czeka na dane z dysku, czy z sieci jest bezczynny i swoje przetwarzanie mógłby przekazać na chwilę innemu programowi - inaczej _procesowi_.

Czasami, niektóre programy mogą wykonywać wiele rzeczy naraz, mimo że są jednym procesem. 

W tym celu uruchamiają podprocesy - inaczej _wątki_.

Wątki współdzielą pamięć i mogą konkurować o dostęp do procesora. 

Dzięki temu w momencie, gdy jedne instrukcje kodu nie potrzebują korzystać z procesora - bo oczekują na przykład na odczytanie danych z bazy - mogą przekazać ten zasób innym wątkom. 

Poprzez szybkie _przełączanie kontekstu_ procesora, wiele działań programu może wykonywać się niemal jednocześnie z punktu widzenia użytkownika. 

Dzięki programom wielowątkowym jedna aplikacja w Javie jest w stanie obsłużyć na przykład 1000 zapytań HTTP na sekundę, zapisywać dane do bazy i wykonywać skomplikowane obliczenia matematyczne - jednocześnie. 

Tworząc komercyjne aplikacje Javowe, nie sposób nie korzystać z wątków. 

Niezależnie czy tworzysz oprogramowanie bez żadnego frameworka, czy oparte na Springu, Akce, bądź innych narzędziach Twoja aplikacja korzysta z wątków w bardzo wielu miejscach. 

Każda aplikacja HTTP w Javie korzysta z wątków do obsługi zapytań klientów. 

Czy wiesz, jak duży ruch jest w stanie obsłużyć? Jak bardzo jest wykorzystywana pula wątków w niej używana? Co się stanie, gdy Twoja liczba żądań do Twojej aplikacji będzie zbyt duża? Jeśli chcesz się tego dowiedzieć, powinieneś przestudiować temat programowania wielowątkowego. 

Dzisiaj zapraszam Cię do [pobrania mojego dokumentu](https://sztukakodu.pl/watki), w którym prezentuję 8 ciekawych rzeczy, których mogą nie wiedzieć Twoi koledzy.

