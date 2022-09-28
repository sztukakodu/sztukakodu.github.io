---
layout: post
title: Jeden By Wszystkim Rządzić - SDKMAN!
description: 
image: /images/sdkman.png
tags: [sdkman, narzedzia, terminal]
---

Czy znasz to denerwujące uczucie, gdy potrzebujesz zainstalować nową wersję języka na swój komputer? Szukanie w internecie odpowiedniej instalki, pobieranie i uruchamianie sprawia, że zawsze odechciewa Ci się upgrade-u. A co w sytuacji, gdy potrzebujesz wielu wersji języka w zależności od projektu? Wtedy sprawa jest jeszcze bardziej irytująca i masz dość zarządzania środowiskami uruchomieniowymi. Ja też tak miałem. Do kiedyś.

Potem trafiłem na narzędzie [SKDMAN!](https://sdkman.io/) i mój świat zmienił się w lepsze miejsce. SDKMAN! to narzędzie do zarządzania środowiskami uruchomieniowymi dla różnych języków JVM-owych, wzorowane na projektach ze świata Rubiego (rbenv), czy Node.js-a (nvm).
Z jego pomocą instalacja odpowiedniej wersji Javy, Scali, czy Grooviego nie jest już problemem.

Wystarczy sprawdzić jakie wersje są dostępne, a potem zainstalować odpowiednią.

```bash
➜  ~ sdk ls java
================================================================================
Available Java Versions
================================================================================
 Vendor        | Use | Version      | Dist    | Status     | Identifier
--------------------------------------------------------------------------------
 AdoptOpenJDK  |     | 12.0.1.j9    | adpt    |            | 12.0.1.j9-adpt
               |     | 12.0.1.hs    | adpt    |            | 12.0.1.hs-adpt
               |     | 11.0.3.j9    | adpt    |            | 11.0.3.j9-adpt
               |     | 11.0.3.hs    | adpt    |            | 11.0.3.hs-adpt
               |     | 8.0.212.j9   | adpt    |            | 8.0.212.j9-adpt
               |     | 8.0.212.hs   | adpt    |            | 8.0.212.hs-adpt
 Amazon        |     | 11.0.3       | amzn    |            | 11.0.3-amzn
               |     | 8.0.212      | amzn    |            | 8.0.212-amzn
               |     | 8.0.202      | amzn    |            | 8.0.202-amzn
 Azul Zulu     |     | 12.0.2       | zulu    |            | 12.0.2-zulu
               |     | 11.0.4       | zulu    |            | 11.0.4-zulu
               |     | 11.0.3       | zulu    | local only | 11.0.3-zulu
               |     | 10.0.2       | zulu    |            | 10.0.2-zulu
               |     | 9.0.7        | zulu    |            | 9.0.7-zulu
               |     | 8.0.222      | zulu    |            | 8.0.222-zulu
               |     | 8.0.202      | zulu    |            | 8.0.202-zulu
               |     | 7.0.232      | zulu    |            | 7.0.232-zulu
               |     | 7.0.181      | zulu    |            | 7.0.181-zulu
 Azul ZuluFX   |     | 11.0.2       | zulufx  |            | 11.0.2-zulufx
               |     | 8.0.202      | zulufx  |            | 8.0.202-zulufx
 BellSoft      |     | 12.0.1       | librca  |            | 12.0.1-librca
               |     | 11.0.3       | librca  |            | 11.0.3-librca
               |     | 8.0.212      | librca  |            | 8.0.212-librca
 GraalVM       |     | 19.1.1       | grl     |            | 19.1.1-grl
               |     | 1.0.0        | grl     |            | 1.0.0-rc-16-grl
 Java.net      |     | 14.ea.5      | open    |            | 14.ea.5-open
               |     | 13.ea.29     | open    |            | 13.ea.29-open
               |     | 12.0.2       | open    |            | 12.0.2-open
               | >>> | 12.0.1       | open    | local only | 12.0.1-open
               |     | 11.0.2       | open    |            | 11.0.2-open
               |     | 11.0.1       | open    | local only | 11.0.1-open
               |     | 10.0.2       | open    |            | 10.0.2-open
               |     | 9.0.4        | open    |            | 9.0.4-open
 SAP           |     | 12.0.2       | sapmchn |            | 12.0.2-sapmchn
               |     | 11.0.4       | sapmchn |            | 11.0.4-sapmchn
================================================================================
Use the Identifier for installation:

    $ sdk install java 11.0.3.hs-adpt
================================================================================
➜  ~
```


I teraz siup, instalujemy Javę 11.

```bash
sdk install java 11.0.3.hs-adpt
```

Odkąd poznałem SDKMAN! nie chcę wracać do czasów, gdy szukałem odpowiednich binarek w Googlu, a potem instalowałem, jednocześnie martwiąc się, która będzie tą domyślną w moim systemie.

Teraz instaluję wszystkie potrzebne wersje prosto z terminala, a gdy potrzebuję wybrać konkretną dla danego projektu wołam po prostu:

```bash
sdk use java 8.0.222-zulu
```

## Czego Mi Brakuje?
Nie wszystko jest jeszcze gotowe i w zasadzie do pełni szczęścia brakuje mi jednej rzeczy. **Łatwego ustawiania wersji per projekt**.

Obecnie mamy dwie możliwości:

1. ustawić domyślną wersję języka w całym systemie - `sdk default`,
2. ustawić wersję w danej powłoce `sdk use`.

Idealnym rozwiązaniem byłaby możliwość tworzenia plików `.sdkrc`, w których definiowalibyśmy wersję języków w danym projekcie. Pracę nad tą funkcją [już się rozpoczęły](https://github.com/sdkman/sdkman-cli/issues/683), ale jeszcze czekają na implementację.

### Jak ja sobie z tym radzę?
Tworzę krótkie skrypty `sdkinit.sh` i kiedy widzę, że coś z wersjami języków jest nie tak odpalam je w danej powłoce.

Przykładowo skrypt może wyglądać tak:

```shell
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk use groovy 2.4.16
sdk use java 8.0.212-zulu
```

Teraz odpalam go w [specjalny sposób](https://twitter.com/darek1024/status/1152146865263120385):

```shell
. ./sdkinit.sh
```

I mogę korzystać z poprawnie skonfigurowanego środowiska.

***

Tyle ode mnie. Daj znać, czy też korzystasz z SDKMAN!, czy radzisz sobie z zarządzaniem wersjami w świecie JVM w jakiś inny sposób ;)
