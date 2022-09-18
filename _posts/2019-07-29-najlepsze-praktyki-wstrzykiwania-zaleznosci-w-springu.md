---
layout: post
title: Najlepsze Praktyki Wstrzykiwania Zależności w Springu
description: 
image: /images/di.png
tags: [spring, początkujący]
---

Wstrzykiwanie zależności to najważniejsza funkcja Springa. To dzięki niemu nie musimy ręcznie tworzyć całego grafu obiektów naszej aplikacji. Wystarczy, że zarejestrujemy nasze _beany_ w kontekście Springa a ten automatycznie zajmie się dostarczeniem ich w potrzebne miejsca. O ile technika ta jest bardzo przydatna i popularna, o tyle nie trudno ustrzec się od błędów. Zapraszam do wpisu, w którym zaprezentuję dobre i złe praktyki z nią związane.

## 1. Wstrzykiwanie przez pola, czy przez konstruktor?
Jeśli chodzi o wstrzykiwanie zależności mamy dwa podejścia. Przez pola i przez konstruktor. Wstrzykiwanie przez pola wygląda w następujący sposób.

    class EmailSender {
      @Autowired
      private EmailRepository repository;
    
      @Autowired
      private EmailService emailService;
    
      // business methods
      void sendEmails() {
        // ...
      }
    }

W tym przypadku przy tworzeniu _beana_ `EmailSender` Spring najpierw tworzy go za pomocą domyślnego, pustego konstruktora - `new EmailSender()`, a potem za pomocą refleksji ustawia wartości prywatnych pól - `repository` i `emailService`. Czy możemy zrobić to lepiej? Zobaczmy, jak wygląda wstrzykiwanie przez konstruktor:

    class EmailSender {
      private final EmailRepository repository;
      private final EmailService emailService;
    
      @Autowired
      EmailSender(EmailRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
      }
    
      // business methods
      void sendEmails() {
        // ...
      }
    
    }

W tym momencie tworząc nową instację `EmailSender-a` Spring **od razu tworzy prawidłowy obiekt** wołając konstruktor `new EmailSender(repository, emailService)`. Dodatkowo wstrzyknięte zależności oznaczone są słowem kluczowym `final`, dzięki któremu po pierwsze mamy pewność, że nikt ich więcej nie zmieni, a po drugie upewniamy się, że `EmailSender` zostanie udostępniony innym obiektom wtedy i tylko wtedy, gdy zostanie poprawnie stworzony do końca (klasa nie wycieknie częściowo zainicjalizowana). W pierwszym przypadku przez pewien moment `EmailSender` jest w niepoprawnym stanie i jego zależności są puste. W takiej sytuacji nietrudno o `NullPointerException` i niespodziewane błędy. Drugie podejście gwarantuje nam też sprawdzenie poprawności tworzenia `EmailSendera`. Po pierwsze, nie mamy innej możliwości stworzenia go, niż przez konstruktor - który wymaga wszystkich argumentów, a po drugie przy zmianie listy tych zależności, od razu dostaniemy błąd kompilacji. Dlatego zawsze warto deklarować zależności swoich klas przez konstruktor, a nie przez pola.
## 2. Wstrzykiwanie wszystkiego co się da
Poznając Springa i jego możliwości wstrzykiwania zależności wiele osób może mieć tendencję do tworzenia wszystkich komponentów aplikacji za pomocą mechanizmu automatycznego wstrzykiwania. To błąd. Niekoniecznie trzeba wszystkie nasze klasy oddać w ręce frameworka. W wielu przypadkach okazuje się, że **dużo lepiej jest tworzyć obiekty ręcznie**. Dzięki temu mamy większą kontrolę nad tym jak obiekty są tworzone i z jakimi parametrami zostały uruchomione. Dla Spring możemy zostawić stworzenie większych agregatów zawierających całe grafy obiektów, które wcześniej stworzyliśmy wołając samodzielnie konstruktory. Jak to może wyglądać? Na przykład tak.

    @Configuration
    class EmailConfiguration {
    
      @Bean
      public EmailFacade emailFacade(EmailRepository repository) {
        EmailService emailService = new MailgunEmailService(mailgun.apiKey(), mailgun.apiSecret());
        EmailSender sender = new EmailSender(repository, emailService);
        EmailTemplateEngine templateEngine = new ThymeleafEmailTemplateEngine(...);
        return new EmailFacade(sender, templateEngine);
      }
    }

W tym momencie korzystamy ze wstrzyknięcia `EmailRepository` przez Springa, a na zewnątrz do kontekstu frameworka zwracamy tylko `EmailFacade`. Klasy `EmailService` czy `EmailSender` w ogóle nie trafiają do Springa i tym samym ograniczamy jego wpływ frameworka na architekturę naszej aplikacji.
## 3. Wstrzykiwanie konkretnych klas, czy interfejsów?
Kolejna lekcja dotycząca wstrzykiwania zależności dotyczy odwiecznego problemu: konkretna implementacja vs interfejs. Wielu osobom może wydawać się, że jeśli mamy tylko jedną implementację danej odpowiedzialności biznesowej to nie ma sensu bawić się w interfejsy. To błąd. Korzystanie z interfejsów pozwoli nam w bardzo wygodny sposób tworzyć obiekty w zależności od kontekstu. Jakiego kontekstu? **Bardzo często potrzebujemy innych usług na różnych środowiskach** : uruchamianie aplikacji na maszynie dewelopera, uruchamianie testów, uruchamianie na środowisku testowym, uruchamianie na produkcji. Wyobraź sobie ponownie klasę `EmailService`, która służy do wysyłki maili do klientów. Jeśli w tym celu korzystamy z zewnętrznej usługi (np. `Mailgun`) moglibyśmy mieć tylko jedną konkretną implementacją, która wysyła maile. Ale o wiele lepiej jest wydzielić interfejs `EmailService` i dostarczyć różne implementacje w zależności od kontekstu:
- `MailgunEmailService` - do faktycznej wysyłki za pomocą serwisu, np. na produkcji, czy środowisku testowym (sandbox, staging),
- `ConsoleEmailService` - do uruchamiania na maszynie deweloperskiej, zamiast wysyłania maili wypisuje ich treść na konsolę,
- `CaptchuringEmailService` - do testów, zamiast wysyłać maile zapisuje je w pamięci i pozwala na weryfikację założeń.
Jeśli zawsze tworząc nowe _beany_ Springa, będziesz stosował się do tej zasady, długoterminowo zobaczysz jak łatwo testuje i modyfikuje się Twoją aplikację. Programowanie w Javie i Springu może być przyjemne nie tylko w pierwszych 3 miesiącach projektu, ale także po 2, 3 czy 5 latach ;)
## 4. Używanie wielu konstruktorów (najlepszy jest jeden i koniec kropka)
Zdarza się, że definiując komponenty aplikacji potrzebujemy różnych zachowań. Wtedy - korzystając już z punktu 1 - tworzymy różne konstruktory naszej klasy.

    class EmailSender {
      private final EmailRepository repository;
      private final EmailService emailService;
      private EmailBlacklist blacklist;
    
    
      EmailSender(EmailRepository repository, EmailService emailService) {
        this(repository, emailService, null);
      }
    
      EmailSender(EmailRepository repository, EmailService emailService, EmailBlacklist blacklist) {
        this.repository = repository;
        this.emailService = emailService;
        this.blacklist = blacklist;
      }
    
    }

To niestety kolejny błąd. Po pierwsze nie możemy skorzystać z automatycznego tworzenia obiektu przez Springa - ponieważ nie będzie wiedział, który konstruktor wybrać - a po drugie tworzymy zamieszanie dla programistów, który konstruktor jest właściwy. Nigdy nie doprowadzaj do sytuacji, w której tworzenie Twojej klasy może prowadzić do dwóch różnych stanów. Powinieneś mieć zawsze **jeden konstruktor, który stworzy poprawny obiekt**. Jeśli potrzebujesz zmienić zachowanie danego komponentu w zależności od środowiska (np. `EmailBlacklist`), to - stosując punkt 3 - **dostarcz inną implementację**. Ale nigdy nie pozwól stworzyć obiektu w niepoprawny sposób, pozwalając tym samym na tworzenie niepoprawnych (pustych) zależności. Więcej konstruktorów możesz mieć tylko w momencie, gdy one w rezultacie też tworzą poprawny obiekt. Na przykład jak poniżej.

    class EmailSender {
      private final EmailRepository repository;
      private final EmailService emailService;
      private final EmailBlacklist blacklist;
    
    
      EmailSender(EmailRepository repository, EmailService emailService) {
        this(repository, emailService, EmailBlacklist.empty());
      }
    
      EmailSender(EmailRepository repository, EmailService emailService, EmailBlacklist blacklist) {
        this.repository = repository;
        this.emailService = emailService;
        this.blacklist = blacklist;
      }
    
    }

Zauważ, ze teraz pole EmailBlacklist otrzymało modyfikator `final`, a EmailSender nie będzie posiadał pól, które ustawione są na `null-e`.
## 5. Stosowanie Profili
Ostatnim elementem, który warto zastosować przy definicji swoich komponentów w Springu jest wykorzystanie profili. Dzięki temu, łatwo będziesz mógł wybrać konkretną implementację danej klasy w zależności od kontekstu uruchomienia aplikacji. Na przykład.

    @Configuration
    class EmailConfiguration {
    
      @Bean
      @Profile({"production", "staging", "sandbox"})
      public EmailService mailgunEmailService() {
        return new MailgunEmailService(mailgun.apiKey(), mailgun.apiSecret());
      }
    
      @Bean
      @Profile("dev")
      public EmailService consoleEmailService() {
        return new ConsoleEmailService();
      }
    
      @Bean
      @Profile("test")
      public EmailService testEmailService() {
        return new CaptchuringEmailService();
      }
    }

Teraz podając odpowiednie wartości startowae, np. `--spring.profiles.active=dev`, możesz w łatwy sposób wybrać, która klasa zostanie stworzona przez Springa. W tym przypadku będzie to `consoleEmailService`.
## Podsumowanie
To wszystko na dzisiaj. Teraz powinieneś wiedzieć już jakie są najlepsze praktyki dotyczące wstrzykiwania zależności w Springu. Jeśli chcesz wiedzieć więcej, to przygotowałem dokument, w którym prezentuję [**10 Najlepszych Sztuczek Senior Deweloperów w Springu**](https://strony.sztukakodu.pl/10), w którym znajdziesz więcej takich porad. Dziękuję Ci za Twój czas i jeśli mogę Ci jakoś pomóc, daj znać w komentarzu poniżej ;)
