---
layout:	post
title: Ile requestów HTTP obsłuży Twoja aplikacja? I jaki wpływ mają na to wątki?
description: Domyślnie aplikacja webowa w Springu uruchamiana jest na wbudowanym serwerze Tomcat.
image: /images/jakobliczyc.jpg
tags: [współbieżność, spring, http]
---

Domyślnie aplikacja webowa w Springu uruchamiana jest na wbudowanym serwerze Tomcat.

Każde żądanie HTTP, które przychodzi do aplikacji zostaje przypisane do jednego wątku, który je obsługuje.

Takich wątków jest domyślnie 200.

> Wartość tę można [nadpisać propertiesem](https://www.sztukakodu.pl/jak-pracowac-z-propertiesami-w-springu-najlepsze-praktyki-i-rady) `server.tomcat.threads.max`

Ile requestów obsłuży twoja aplikacja?

Tyle, ile ich maksymalnie może na raz przyjąć.

Jest na to prosty wzór: **liczba wątków / średni czas obsługi requestu**.

Wynik to liczba requestów na sekundę. 

Czyli innymi słowy *throughput* twojej aplikacji.

Im większy *throughput*, tym więcej żądań HTTP Twoja aplikacja obsłuży.

### Przykłady:
(dla serwera z 200 wątkami)

- średni czas trwania requestu: 1 sekunda => throughput: 200 RPS (*requests per second* - żądań na sekundę)
- średni czas trwania requestu: 500 ms => throughput = 400 RPS
- 200 ms => 1.000 RPS
- 100 ms => 2.000 requestów na sekundę.


To oczywiście w warunkach laboratoryjnych i w sytuacji, gdy Twoja aplikacja skaluje się z kolejnym dodatkowym ruchem liniowo (rzadko tak jest).

Niemniej jednak, warto wiedzieć jak średni czas trwania danego żądania i liczba wątków wpływa na maksymalną ilość żądań HTTP jakie Twoje aplikacja może obsłużyć.
