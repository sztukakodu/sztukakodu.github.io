---
layout:	post
title: Dlaczego Learning Domain Driven Design to najlepsza książka o DDD jaką czytałem?
description: 
image: /images/1500x1000.png
tags: [DDD, architektura, craftsmanship]
---

W tym roku trafiła w moje ręcę książka **Learning Domain-Driven Design, Aligning Software Architecure and Business Strategy** Vlada Khononova.

Już po przeczytaniu pierwszych 3 rozdziałów, napisałem na Twitterze, że to najlepsza książka o DDD z jaką miałem do tej pory do czynienia.

Dlaczego tak uważam?

O tym w dzisiejszym wpisie.

<blockquote class="twitter-tweet" data-lang="pl" data-theme="light"><p lang="en" dir="ltr">I read only three chapters yet, but so far it’s the best book on DDD I had a chance to read. <br><br>👏 <a href="https://twitter.com/vladikk?ref_src=twsrc%5Etfw">@vladikk</a> <a href="https://t.co/e0UUOXzpZp">pic.twitter.com/e0UUOXzpZp</a></p>&mdash; Darek Mydlarz 🧑‍💻 (@darekmydlarz) <a href="https://twitter.com/darekmydlarz/status/1619333611471392769?ref_src=twsrc%5Etfw">28 stycznia 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Moje dotychczasowe doświadczenie z DDD

Znałem z konferencji, wykładów, prelekcji, podcastów (szacun Mariusz Gil).

Czytałem (lub próbowałem czytać) czerwoną książkę Vernona i niebieską książkę Evansa.

Przy pierwszej się poddałem.

Drugą ostatecznie wchłonąłem w wersji polskiej (tłumacze - wstydźcię się!).

Przejrzałem także kurs Macieja Aniserowicza - Droga Nowoczesnego Architekta.

Ale ciągle czułem, jakby kolekcjonował kropki.

Bez łączenia ich w jedną całość.

## I wtedy wjechała TA KSIĄŻKA. Cała na biało.

Przejdźmy po niej, rozdział po rozdziale.

### Część 1 - DDD Strategiczne

1. Analiza Domeny Biznesowej
2. Odkrywanie Wiedzy Domenowej
3. Zarządzanie Złożonością Domenową
4. Integracja Ograniczonych Kontekstów (Bounded Contexts)

Pierwsza część książki wprowadza nas w świat DDD.

Mówi o tym, po co to robimy i dlaczego.

Wprowadza takie pojęcia jak Domena Biznesowa, Subdomena.

Porównuje ich rodzaje.

1. Domena Podstawowa (core domain),
2. Domena Wspierająca (supporting domain),
3. Domena Generyczna (generic domain).

W zależności od problemu i złożoności wprowadza podpowiedzi jak powinna być wyprodukowana.


| Typ Domeny               	| Przewaga konkurencyjna 	| Złożoność 	| Zmienność 	| Implementacja            	| Problem    	|
|--------------------------	|-----------------------	|-----------	|-----------	|--------------------------	|------------	|
| Podstawowa (Core)        	| Tak                    	| Wysoka    	| Wysoka    	| Wewnątrz firmy           	| Ciekawy    	|
| Generyczna (Generic)     	| Nie                    	| Wysoka    	| Niska     	| Kup / Zintegruj          	| Rozwiązany 	|
| Wspierająca (Supporting) 	| Nie                    	| Niska     	| Niska     	| Wewnątrz firmy / deleguj 	| Oczywisty  	|
{: .wide-element }

W tej częśći dowiesz się także czym jest Model, Kontekst Ograniczony (Bounded Context) oraz jak integrować konteksty ze sobą.

Zaproponowane sposoby integracji to:

1. Współpraca (Partnership)
2. Współdzielone Jądro (Shared Kernel)
3. Klient-Dostawca (Customer-Supplier)
4. Konformista (Conformist)
5. Warstwa Antykorozyjna (Anticorruption Layer)
6. Usługa Otwartego Hosta (Open Host Service)
7. Osobne Drogi (Separate Ways)

### Część II - DDD Taktyczne

{:start="5"}
5. Implementacja Prostej Logiki Biznesowej
6. Obsługa Złożonej Logiki Biznesowej
7. Modelowanie Wymiaru Czasu
8. Wzorce Architektoniczne
9. Wzorce Komunikacyjne

### Część III - Stosowanie DDD w Praktyce

{:start="10"}
10. Heurystyki Architektoniczne
11. Ewolucja Decyzji Architektonicznych
12. Event Storming (brak kolorów! 😢)
13. DDD w prawdziwym świecie (Strangler Fig Pattern)

### Część IV - Relacja z innymi Metodykami i Wzorcami

{:start="14"}
14. Mikroserwisy
15. Event-Driven Architecture (EDA)
16. Data Mesh

## Podsumowanie
1. Realne przykłady aplikacji z życia (down to earth)
2. Ćwiczenia na koniec każdego rozdziału (!)
3. Czytelne diagramy i tabelki
4. Szeroke pokrycie tematu DDD & Architektury (including Ports & Adapters, CQRS)
5. Logiczne wprowadzanie kolejnych pojęć i prowadzenie za rękę
6. Tłumaczenie od ogółu do szczegółu

(TBD)