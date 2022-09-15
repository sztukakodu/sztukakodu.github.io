---
layout: post
title:  Jak sprawdzić, którą wersję biblioteki Log4j używa Twój projekt (Gradle)?
description: Tydzień temu – światem Javy – wstrząsnęła informacja o poważnej dziurze bezpieczeństwa w bibliotece do logowania Log4j. Podatność ta pozwalała na wstrzyknięcie na serwery aplikacji kodu dostarczonego przez atakującego.
date:   2021-12-19 13:24:35 +0200
image:  /images/jak-sprawdzic.jpg
tags:   [gradle, security, java, log4j]
---

Tydzień temu - światem Javy - wstrząsnęła informacja o poważnej dziurze bezpieczeństwa w bibliotece do logowania **Log4j**. Podatność ta pozwalała na wstrzyknięcie na serwery aplikacji kodu dostarczonego przez atakującego.

Problem jest o tyle poważny, że jest to jedna z dwóch najpopularniejszych bibliotek do logowania obok Logbacka.

Oznacza to, że szacunkowo problem dotyczy nawet połowy oprogramowania tworzonego w Javie.

Ale jak w ogóle sprawdzić czy jesteśmy zagrożeni?


## Zacznijmy od wyjaśnienia, kiedy w ogóle problem nas dotyczy.

Jesteś zagrożony jeśli w Twojej aplikacji:

* używasz log4j w wersji `2.0.x`-`2.15.0`
* masz w zależnościach `org.apache.logging.log4j:log4j-core`.
* do Twojej aplikacji można podać wejście od użytkownika

Jeśli:

* nie masz zależności na `log4j-core`, lub..
* używasz log4j w wersji 1.x, lub...
* używasz log4j w wersji 2.16.0 lub...
* na 100% nie logujesz tego, co wysyła do Ciebie użytkownik...

To jesteś bezpieczny :)

Jak więc to sprawdzić? 

Jeśli Twój projekt oparty jest o `Gradle`, to poniżej pokażę Ci na to 3 sposoby.

## Sposób 1 - dependencyInsight

Bezpośrednio na swoim projekcie wołasz z konsoli komendę

```
$ gradle dependencyInsight --dependency log4j-core
```

Jeśli masz aplikację wielomodułową musisz zawołać to zadanie na każdym z modułów.

```
$ gradle :app:dependencyInsight --dependency log4j-core
$ gradle :background:dependencyInsight --dependency log4j-core
```

Gdzie `app` i `background` to nazwy modułów aplikacji.

Jako wynik dostaniesz informacje o tym, czy wciągasz daną bibliotekę do swojej aplikacji i jeśli tak, to w jakiej wersji.

## Sposób 2 - findDependency

W pliku `build.gradle` dodajesz nowe zadanie:

```
task findDependency(type: DependencyInsightReportTask) {}
```

Aby odszukać używane w Twoim projekcie wersje `log4j` wystarczy teraz zawołać.

```
$ gw findDependency --configuration compile --dependency log4j
```

Jeśli masz projekt wielomodułowy opakuj zadanie w dyrektywę `allprojects`.

```
allprojects {
    task findDependency(type: DependencyInsightReportTask) {}
}
```

Teraz zawołaj komendę jeszcze raz. Tym razem za jednym uruchomieniem dostaniesz wyniki z wszystkich modułów.


## Sposób 3 - dependency locking

Do pliku `build.gradle` dodaj:

```
configurations {
    compileClasspath {
        resolutionStrategy.activateDependencyLocking()
    }
    runtimeClasspath {
        resolutionStrategy.activateDependencyLocking()
    }
}
```

I zawołaj

```
$ gradle build --write-locks -x test
```

Ta komenda wygeneruje Ci dla każdego z modułów pliki `gradle.lockfile` z wersjami zależności, które będzie używał twój projekt.

W tych plikach sprawdź jakie wersje log4j zaciągasz.

Możesz do tego użyć narzędzia `ripgrep`.

```
$ rg 'log4j' -g '*.lockfile'
```

Lub starego, dobrego zwykłego `grepa`.

```
grep -r --include "*.lockfile" log4j .
```

# Podsumowanie
O ile, mam nadzieję, podatności w swoim serwisie masz już przemigrowane, o tyle nie wiadomo, co przyniesie przyszłość.

Jeśli będziesz jeszcze potrzebować sprawdzić wersje zależności w twoim projekcie możesz użyć jednego z trzech sposobów zaprezentowanych powyżej.