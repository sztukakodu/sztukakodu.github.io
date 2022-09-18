---
layout: post
title: Jak pracować z propertiesami w Springu? Najlepsze praktyki i rady
description: 
image: /images/1500x1000.png
tags: []
---

Wstrzykiwanie propertiesów może być jedną z najbardzej wartościowych praktyk programistycznych w Twoim arsenale. Jeśli będziesz ich używać w odpowiedni sposób mogą stać się niezastąpionym kompanem w uruchamianiu aplikacji na różnych środowiskach, czy na szybkim zmienianiu sposobu działania bez potrzeby ponownej kompilacji. Jeśli chcesz dowiedzieć się jak pracować z nimi w Springu, to zapraszam do poniższego wpisu.

## Czym są propertiesy i co w nich umieszczać?
Zanim przejdziemy do szczegółów technicznych samego frameworka, odpowiedzmy sobie na pytanie, czym są propertiesy.

> Są to wartości liczbowe i tekstowe, które wstrzykujemy do aplikacji w momencie uruchomienia.

Dobrymi przykładami mogą być: 1. dane do połączenia z bazą danych (URL-e, dane użytkownika do zalogowania), 2. definicje częstości wykonywania zadań cyklicznych przez aplikację (np. wyrażenia CRON, chociażby definiujące daty wysyłki maili do użytkowników), 3. adresy i dane dostępowe do zewnętrznych API, 4. limity połączeń do zewnętrznych serwisów, 4. flagi uruchamiające, lub wyłączające jakieś funkcje systemu. Parametry takie mogą oczywiście posiadać zdefiniowane w aplikacji wartości domyślne.
## Jak wstrzykiwać propertiesy?
W Springu istnieje na to wiele sposobów. Najprostszy to adnotacja `@Value` nad polem, które można wstrzyknąć konstruktorem (zalecane!) lub w formie deklaracji w klasie.

    class Wikipedia {
    
      public Wikipedia(@Value("${app.apis.wikipedia.max-concurrent-connections:6}") Long maxConcurrentConnections, ...) {
        this.maxConcurrentConnections = maxConcurrentConnections;
        // ...
      }
    }

Zastosowania składnia `${app.apis.wikipedia.max-concurrent-connections:6}` oznacza, że zostania użyta wartość parametru przekazana pod kluczem `app.apis.wikipedia.max-concurrent-connections`, lub w przypadku jej braku domyślna wartość `6`.
* * *
Innym sposobem jest pobranie parametru z klasy `Environment` metodą `getProperty` . Klasę `Environment` mamy dostępną w kontekście Springa, więc możemy swobodnie z niej czytać.

    class Wikipedia {
    
      public Wikipedia(Environment environment, ...) {
        this.maxConcurrentConnections = environment.getProperty("app.apis.wikipedia.max-concurrent-connections");
        // ...
      }
    }

* * *
Trzeci sposób, **najbardziej przeze mnie zalecany** , to stosowanie `@ConfigurationProperties`. Za pomocą tej adnotacji budujemy wygodne i eleganckie klasy przechowujące zestaw parametrów znajdujących się pod tym samym kluczem nadrzędnym.

    @Value 
    @ConfigurationProperties("app.apis.wikipedia")
    public class WikipediaConfig {
      String apiUrl;
      Long maxConcurrentConnections;
      String apiToken;
    }

Wówczas instancję tej klasy tworzy dla nas Spring, a nam zostaje jedynie wstrzyknięcie jej w odpowiednie miejsce. Wtedy zalecamy zapisać w zainteresowanej klasie referencję do całego `configa` i korzystać z odpowiednich parametrów w momencie wołania metod.

    class Wikipedia {
    
        public Wikipedia(WikipediaConfig config) {
            this.config = config;
            // ...
        }
    
        List<Article> searchByPhrase(String phrase) {
            String url = config.getApiUrl();
            // ...
        }
    }

## Jak ustawiać propertiesy?
Ok, wiemy już jak odczytywać parametry w aplikacji, ale jak je w ogóle przekazać? Istnieje... kilka sposobów :)
### Plik application.properties
Najprostszy sposób, to skorzystanie z pliki `application.properties` (lub jego odpowiednika w YAML-u: `application.yml`). Wystarczy utworzyć go w katalogu `src/main/resources` a Spring Boot automatycznie załaduje go podczas uruchamiania aplikacji.

    app.apis.wikipedia.apiUrl=https://api.wikipedia.org

### Plik application-profile.properties
Oprócz standardowego pliku `application.properties` możemy łatwo nadpisać znajdujące się w nim wartości stosując profile aplikacji (ustawiane przełącznikiem podczas startu `-Dspring.profiles.active=staging`). Jedną z konsekwencji użycia profilu jest możliwość zaczytania dedykowanego pliku z parametrami z nazwą profilu w nazwie pliku, np. `application-staging.properties`.
### Zmienne środowiskowe
Jeszcze innym sposobem jest przekazywanie konkretnych parametrów za pomocą zmiennych środowiskowych. Uruchamiając aplikację wystarczy, że podamy parametr `-Dapp.apis.wikipedia.apiUrl=http://api.wikipedia.local`. Jeśli chcemy uprościć cały proces, możemy nazwać zmienną środowiskową w pliku `properties` i za jej pomocą przekazać odpowiednią wartość.

    spring.data.jdbc.url=${JDBC_URL:jdbc:postgresql://host:port}

Wtedy startujemy aplikację z parametrem `-DJDBC_URL=jdbc:postgresql://localhost:3000` lub ustawiając zmienną środowiskową na odpowiednią wartość.
## Jak nadpisywać?
Jeśli chcemy w trakcie uruchamiania aplikacji podać cały plik z nowymi parametrami możemy to zrobić za pomocą parametru `spring.config.additional-location`. Wówczas nowe wartości będą mieć wyższy priorytet, od tych już zdefiniowanych plikiem `.properties`.

    java -jar app.jar -Dspring.config.additional-location="C:/myapp/path/to/config/"

## Jak sprawdzić podstawione wartości?
Jest dużo sposobów wstrzykiwania wartości do aplikacji. Jak zatem sprawdzić co ostatecznie się w niej znalazło? Wystarczy, że mamy w aplikacji dodaną zależność do [Actuatora](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html). Wtedy w `application.yml` wypisujemy endpointy, które chcemy uruchomić (nas interesuje głównie `env`).

    management:
      endpoints:
        web:
          exposure:
            include: info, health, metrics, env

Potem uderzamy w adres [http://localhost:8080/actuator/env](http://localhost:8080/actuator/env) i możemy zobaczyć jakie dokładnie parametry zostały dodane do aplikacji.
## Podsumowanie
Pisząc aplikację tworzymy pewien przepis wykonania reguł biznesowych. Dzięki podstawianiu parametrów z zewnątrz możemy łatwo uruchamiać aplikację w nieco innej formie. W tym wpisie dowiedziałeś się jak można w Springu przekazywać i nadpisywać parametry do swojej aplikacji.
