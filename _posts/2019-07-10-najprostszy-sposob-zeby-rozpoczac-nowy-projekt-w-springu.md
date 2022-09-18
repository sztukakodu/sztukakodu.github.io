---
layout: post
title: Najprostszy Sposób, Żeby Rozpocząć Nowy Projekt w Springu
description: 
image: /images/startspring.png
tags: []
---

Spring to najpopularniejszy obecnie framework służący do budowania aplikacji w Javie. Oferty pracy niemal zawsze wymieniają go w wymaganiach. Ale na początku zawsze musi być ten pierwszy krok - czyli wystartowanie nowego projektu. Jak to zrobić? Zapraszam do środka!Jeśli chcesz rozpocząć nowy projekt masz dwa wyjścia:

1. ręcznie tworzyć nowy projekt Javowy w twoim IDE i dodawać odpowiednie zależności do Springa
2. wejść na stronę [start.spring.io](https://start.spring.io) i mieć to z głowy ;)
Jesteś wygodny, więc wchodzisz na [start.spring.io](https://start.spring.io) i na początek wybierasz następujące opcje:
- project: Gradle Project
- language: Java
- Spring Boot: 2.1.6
- Project Metadata:
  - group: com.darek1024
  - artifact: myapp
  - Options
    - Packaging: Jar
    - Java: 12
I to wszystko. Klikasz **Generate the project** i paczka z nowym projektem Springowym już ląduje na Twoim komputerze. Rozpakowujesz otrzymanego zipa i odpalasz:

    ./gradlew bootRun

W tym momencie do projektu ściągane są wszystkie potrzebne zależności. Po chwili twoim oczom powinno pojawić się następujące wyjście z programu:

    ➜ myapp git:(master) ✗ ./gradlew bootRun
    Using gradle at '/Users/darek/git/myapp/gradlew' to run buildfile '/Users/darek/git/myapp/build.gradle':
    
    Starting a Gradle Daemon, 1 incompatible Daemon could not be reused, use --status for details
    
    > Task :bootRun
    
      . _______ _ _
     /\\ / ___'___ _ _(_)_ ____ _ \ \ \ \
    ( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
     \\/ ___)| |_)| | | | | || (_| | ) ) ) )
      ' | ____| .__ |_| |_|_| |_\__, | / / / /
     =========|_|==============|___/=/_/_/_/
     :: Spring Boot :: (v2.1.6.RELEASE)
    
    2019-07-03 06:51:50.345 INFO 93094 --- [main] com.darek1024.myapp.MyAppApplication : Starting myappApplication on MacBook-Pro-Dariusz.local with PID 93094 (/Users/darek/git/myapp/build/classes/java/main started by darek in /Users/darek/git/myapp)
    2019-07-03 06:51:50.358 INFO 93094 --- [main] com.darek1024.myapp.MyAppApplication : No active profile set, falling back to default profiles: default
    2019-07-03 06:51:51.239 INFO 93094 --- [main] com.darek1024.myapp.MyAppApplication : Started myappApplication in 1.402 seconds (JVM running for 1.891)
    
    BUILD SUCCESSFUL in 13s
    3 actionable tasks: 3 executed

W ten sposób uruchomiłeś pierwszy projekt w Springu. Tak powinna wyglądać struktura plików w projekcie:

    ➜ myapp git:(master) tree  
    .
    ├── HELP.md
    ├── build
    │ ├── classes
    │ │ └── java
    │ │ └── main
    │ │ └── com
    │ │ └── darek1024
    │ │ └── myapp
    │ │ └── MyAppApplication.class
    │ ├── generated
    │ │ └── sources
    │ │ └── annotationProcessor
    │ │ └── java
    │ │ └── main
    │ ├── resources
    │ │ └── main
    │ │ └── application.properties
    │ └── tmp
    │ └── compileJava
    ├── build.gradle
    ├── gradle
    │ └── wrapper
    │ ├── gradle-wrapper.jar
    │ └── gradle-wrapper.properties
    ├── gradlew
    ├── gradlew.bat
    ├── settings.gradle
    ├── myapp.iml
    └── src
        ├── main
        │ ├── java
        │ │ └── com
        │ │ └── darek1024
        │ │ └── myapp
        │ │ └── MyAppApplication.java
        │ └── resources
        │ └── application.properties
        └── test
            └── java
                └── com
                    └── darek1024
                        └── myapp
                            └── MyAppApplicationTests.java

Wypiszmy jeszcze standardowe _Hello, World_ by sprawdzić jak całość ze sobą działa. W tym celu edytuj plik `MyAppApplication.java` i dodaj _beana_ implementującego interfejs `CommandLineRunner`.

    @SpringBootApplication
    public class myappApplication {
    
        public static void main(String[] args) {
            SpringApplication.run(myappApplication.class, args);
        }
    
        @Bean
        public CommandLineRunner commandLineRunner() {
            return new CommandLineRunner() {
                @Override
                public void run(String... args) throws Exception {
                    System.out.println("Hello, World!");
                }
            };
        }
    
    }

Uruchom projekt ponownie i Twoim oczom powinien pokazać się ulubiony napis programistów ;) Jeśli chcesz, na [start.spring.io](https://start.spring.io) możesz już od razu dodawać potrzebne zależności (_dependencies_) do Twojego projektu, ale równie dobrze możesz zacząć z minimalnym zestawem a potem dodawać kolejne elementy w ramach potrzeb, gdy Twój projekt będzie się rozwijał. To wszystko w tej krótkiej lekcji. W kolejnych będę odkrywał przed Tobą następne elementy najpopularniejszego frameworka w świecie Javy.
