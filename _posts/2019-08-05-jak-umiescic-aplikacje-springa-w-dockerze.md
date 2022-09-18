---
layout: post
title: Jak umieścić aplikację Springa w Dockerze
description: 
image: /images/docker.png
tags: [spring, docker, narzędzia]
---

Kontenery stały się jedną z najważniejszych zmian technologicznych w kontekście wytwarzania oprogramowania ostatnich lat. Niezależnie od języka programowania, bycia frontend lub backend deweloperem, testerem czy devopsem, każdy ma dzisiaj styczność z Dockerem i aplikacjami uruchamianymi z kontenera. W jaki sposób umieścić naszą aplikację Springową w kontenerze? Zapraszam.Więc aby stworzyć obraz Dockerowy dla naszej aplikacji potrzebujemy wykonać następujące kroki:

1. Stworzyć aplikację ;)
2. Stworzyć `Dockerfile` - plik opisujący jak ma wyglądać nasz obraz,
3. Dodać plugin do automatycznego budowania obrazu.

> Pełny kod źródłowy przedstawianego przykładu znajdziesz na [https://github.com/darek1024/sk-spring-boot-docker](https://github.com/darek1024/sk-spring-boot-docker)

## Tworzymy aplikację
W [najprostszy możliwy sposób](https://strony.sztukakodu.pl/najprostszy-sposob-zeby-rozpoczac-nowy-projekt-w-springu/) pobieramy aplikację ze Spring Initializr-a. Ja wybieram:
- projekt typu: **Maven** ,
- język: **Java** ,
- Spring Boot: **2.1.6**.
Do listy zależności dokładamy **Spring Web Starter**. Pomoże nam on zweryfikować działanie naszej aplikacji. Pobraną paczkę rozpakowujemy i dodajemy REST-owy kontroler - do obsługi prostego żądania HTTP.

    @RestController
    public class HelloController {
    
        @RequestMapping(method = RequestMethod.GET)
        public String hello(@RequestParam Optional<String> name) {
            return name.map(n -> "Hello " + n + "!").orElse("Hello, World!");
        }
    
    }

Budujemy naszą aplikację.

    ./mvnw package

I uruchamiamy - jak każdą aplikację Javową.

    java -jar ./target/dockerdemo-0.0.1-SNAPSHOT.jar

Gdy aplikacja się uruchomi, sprawdzamy, czy działa jak powinna.

    $ curl localhost:8080
    $ curl 'localhost:8080?name=Adam'

## Przygotowanie Dockerfile
Drugim ważnym elementem układanki jest stworzenie pliku `Dockerfile` - czyli opisu obrazu, który chcemy zbudować. Dzięki niemu **Docker** będzie w stanie skonteneryzować naszą aplikację. Przykładowy plik umieszczamy w głównym katalogu z aplikacją pod nazwą `Dockerfile`.

    FROM openjdk:12-jdk-alpine
    ARG JAR_FILE
    COPY ${JAR_FILE} app.jar
    ENTRYPOINT ["java","-jar","/app.jar"]
    EXPOSE 8080

Co my tu mamy?
#### Obraz źródłowy

    FROM openjdk:12-jdk-alpine

Tworzymy obraz dockerowy na podstawie obrazu `openjdk:12-jdk-alpine`. Bardzo małego obrazu z Javą w wersji 12 wydawaną przez OpenJDK.
#### Paczkę z aplikacją

    ARG JAR_FILE
    COPY ${JAR_FILE} app.jar

Definiujemy zmienną JAR\_FILE i prosimy aby plik na który wskazuje skopiować na ścieżkę `app.jar` w kontenerze.
#### Komendę uruchomieniową

    ENTRYPOINT ["java","-jar","/app.jar"]

Wskazujemy komendę, która ma zostać wywołana w momencie startu aplikacji. W tym wypadku jest to najzwyklejsze `java -jar /app.jar`.
#### Dokumentację wystawianego portu

    EXPOSE 8080

Polecenie `EXPOSE` informuje jaki port wystawia nasza aplikacja. **Uwaga** : jest to tylko polecenie informujące, nie ma ono wpływu na to, które faktycznie porty aplikacja uruchomi.
## Budujemy nasz obraz
Teraz gdy mam gotowy plik `Dockerfile` możemy zbudować obraz Dockerowy poleceniem:

    docker build -t darek1024/myapp .

Gdzie wskazujemy tag, pod którym aplikacja ma się zbudować - `darek1024/myapp` oraz katalog źrodłowy, z którego paczka ma zostać zbudowana. W tym wypadku obecny katalog. A, zapomnielibyśmy jeszcze o `JAR_FILE`. Więc tym razem już pełna komenda.

    docker build --build-arg JAR_FILE=target/dockerdemo-0.0.1-SNAPSHOT.jar \
        -t darek1024:myapp .

Teraz możemy uruchomić naszą aplikację w dockerze.

    docker run darek1024:myapp

Potrzebujemy jednak jeszcze wystawić porty aplikacji by móc się z nią skomunikować. Mamy dwie opcje - automatyczną publikację wszystkich portów (udokumentowanych poleceniem EXPOSE).

    docker run -P darek1024:myapp

Lub wyspecyfikowanie potrzebnych portów i ich mapowań na nasz system.

    docker run -p 9090:8080 darek1024:myapp

W pierwszym przypadku (`-P`) aplikacja uruchomi się na losowym porcie, który możemy podejrzeć komendą `docker ps`. W drugim, po prostu wystarczy jak sprawdzimy stronę `localhost:9080`. Tam powinna stać nasza aplikacja.
## Automatyzacja
Wszystko fajnie, ale jeśli zauważyłeś to mamy w całym procesie dwa manualne kroki, które musimy wykonać jeden po drugim:
1. Zbudować aplikację komendą `./mnvw package` - to utworzy plik `target/dockerdemo-0.0.1-SNAPSHOT.jar`.
2. Zbudować obraz dockerowy komendą `docker build` - z odpowiednimi parametrami.
Za każdym razem, kiedy chcemy stworzyć nowy obraz dockerowy, musielibyśmy wołać te dwie komendy. Czy możemy zrobić to lepiej?
### dockerfile-maven-plugin
Z pomocą - w przypadku Mavena - przychodzi nam [dockerfile-maven-plugin](https://mvnrepository.com/artifact/com.spotify/dockerfile-maven-plugin). Wystarczy do sekcji `build` pliku `pom.xml` dodać następujący wpis:

    <build>
        <plugins>
            <plugin>
                <groupId>com.spotify</groupId>
                <artifactId>dockerfile-maven-plugin</artifactId>
                <version>1.4.12</version>
                <configuration>
                    <repository>${docker.image.prefix}/${project.artifactId}</repository>
                    <buildArgs>
                        <JAR_FILE>target/${project.build.finalName}.jar</JAR_FILE>
                    </buildArgs>
                </configuration>
            </plugin>
        </plugins>
    </build>

A do sekcji `properties` określić prefix naszego obrazu.

    <properties>
        <docker.image.prefix>darek1024</docker.image.prefix>
    </properties>

I... to wszystko! Co teraz? Za pomocą jednej komendy budujemy nowy obraz.

    ./mvnw dockerfile:build

Aby upewnić się, że wszystko przebiegło pomyślnie wystarczy zawołać `docker images` i upewnić się, że nasz nowy obraz został pomyślnie zbudowany.

    $ docker images
    REPOSITORY TAG IMAGE ID CREATED SIZE
    darek1024/dockerdemo latest f19eed76dee0 12 seconds ago 356MB

Zauważ, że w dodanym pluginie wykorzystujemy zmienną `JAR_FILE`, której przekazujemy ścieżkę wynikową do zbudowanej aplikacji w Springu.
## Podsumowanie
Teraz możemy już z łatwością uruchamiać i dystrybuować naszą aplikację w formie obrazu Dockerowego. Jeśli chcesz wiedzieć więcej proszę daj znać w komentarzu jakie treści interesowałyby Cię najbardziej.
