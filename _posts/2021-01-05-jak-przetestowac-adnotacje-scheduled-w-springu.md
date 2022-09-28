---
layout:	video
title: Jak przetestować adnotację @Scheduled w Springu?
description: Korzystasz z adnotacji @Scheduled w swoim Springowym projekcie i chciałbyś mieć pewność, że wykona się ona poprawnie? Chciałbyś napisać do niej test, ale nie do końca wiesz jak się za niego zabrać? Zapraszam do środka, gdzie rozwieję Twoje wszystkie wątpliwości! :)
image: /images/scheduled.jpg
tags: [spring, scheduled, testowanie, wideo]
video: KpvpqF0LTfE
---

Korzystasz z adnotacji `@Scheduled` w swoim Springowym projekcie i chciałbyś mieć pewność, że wykona się ona poprawnie? Chciałbyś napisać do niej test, ale nie do końca wiesz jak się za niego zabrać? Zapraszam do środka, gdzie rozwieję Twoje wszystkie wątpliwości! :)

Załóżmy, że Twoja aplikacja wykonuje jakieś cykliczne zadania. Na przykład raz dziennie wysyła maile do użytkowników z informacjami o nowych ofertach. W tym celu skorzystałeś z adnotacji `@Scheduled` za pomocą, której zdefiniowałeś częstotliwość wykonywania się zadania.

```java
@Component
@AllArgsConstructor
class MailJob {
    private final MailService mailService;

    @Scheduled(cron = "0 0 7 * * MON-FRI")
    public void run() {
        mailService.sendEmails();
    }

}
```

> Wyrażenie CRON `0 0 7 * * MON-FRI` oznacza, że metoda `run()` będzie wykonywać się od poniedziałku do piątku o 7:00.

Jak napisać test do takiej klasy? Rozwiązanie, w którym czekamy z testami codziennie do 7:00 nie brzmi jak najlepszy pomysł ;)

Opcje są dwie.

## Przetestowanie klasy unitowo
Rozwiązanie pierwsze to przetestowanie zachowania z _pominięciem frameworka_. W tym podejściu zakładamy, że adnotacja `@Scheduled` jest zaimplementowana we frameworku poprawnie i to co nas interesuje to zachowanie samej metody `run()`.

Jak może wyglądać wtedy taki test?

```java
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {MailJob.class, MailService.class})
class MailJobTest {

    @Autowired
    MailService mailService;

    @Autowired
    MailJob mailJob;

    @Test
    public void shouldSendMails() {
        // when
        mailJob.run();

        // then
        assertEquals(1L, mailService.sentEmailsCount());
    }

}
```

Gdzie `MailService` dla potrzeb przykładu to bardzo prosta klasa przygotowana na potrzeby demonstracji.

```java
@Service
class MailService {
    private final LongAdder counter = new LongAdder();

    public void sendEmails() {
        System.out.println("Would send emails...");
        counter.increment();
    }

    public long sentEmailsCount() {
        return counter.sum();
    }
}
```

W tym wypadku nie testujemy tego, że operacja wykona się w dni robocze o 7:00 rano, ale tylko to co ona właściwie robi. Czyli, że woła metodą wysyłającą maile z klasy `MailService`.

I jest to bardzo właściwe podejście. Twoja logika metody `run()` może być bardziej rozbudowana.

Sprawdź w teście, że w wyniku zawołania tej metody w systemie zachodzą oczekiwane operacje i zmiany.

## Testujemy zachowanie integracyjne

Możliwe jest też przetestowanie zachowania integracyjne.

Potrzebujemy wtedy wprowadzić jedynie małą zmianę do klasy `MailJob`.

Zamiast definiować wyrażenie `cron` bezpośrednio w kodzie przenosimy je do [propertiesa wstrzykiwanego przez Springa](/jak-pracowac-z-propertiesami-w-springu-najlepsze-praktyki-i-rady/).

```java
@Component
@AllArgsConstructor
class MailJob {
    private final MailService mailService;

    @Scheduled(cron = "${app.mail-job.cron}")
    public void run() {
        mailService.sendEmails();
    }

}
```

W pliku `src/main/resources/application.properties` wpisujemy oczekiwaną produkcyjną wartość parametru.

```properties
app.mail-job.cron=0 0 7 * * MON-FRI
```

Natomiast test wówczas przyjmuje następująca postać.

```java
@SpringBootTest(properties = {
    "app.mail-job.cron=*/1 * * * * *"
})
class MailJobIT {

    @Autowired
    MailService mailService;

    @Test
    public void shouldSendMails() {
        Awaitility.await()
                  .atMost(5, TimeUnit.SECONDS)
                  .until(() -> mailService.sentEmailsCount() > 0);
    }

}
```

Za pomocą adnotacji `@SpringBootTest` uruchomiłem cały kontekst Springa dla celów tego testu, oraz _nadpisałem_ wartość parametru, który jest wstrzykiwany do klasy `MailJob`. 

```java
@SpringBootTest(properties = {
    "app.mail-job.cron=*/1 * * * * *"
})
```

Metoda `run()` będzie teraz wykonywać się co sekundę - zgodnie z nadpisanym wyrażeniem cron `*/1 * * * * *`.

**Po drugie** skorzystałem z biblioteki [Awaitility](https://github.com/awaitility/awaitility), za pomocą której mogę w elegancki sposób napisać test oczekujący na jakiś warunek.

```java
Awaitility.await()
      .atMost(5, TimeUnit.SECONDS)
      .until(() -> mailService.sentEmailsCount() > 0);
```

Powyższy fragment oznacza, że przez maksymalnie 5 sekund oczekujemy spełnienia warunku:

```java
mailService.sentEmailsCount() > 0
```

Jeśli nasze zadanie oznaczone adnotacją `@Scheduled` wykona się poprawnie, to test zaświeci się na zielono. Czego właśnie oczekujemy :)


## Alternatywna droga

Jest jeszcze jedna, alternatywna droga.

Zamiast testować zachowanie i działanie frameworka możemy dodać do projektu metryki i monitoring.

Dzięki temu możemy mierzyć - jak w podanym przykładzie - ile maili zostało wysłanych dziennie z systemu i za pomocą monitoringu walidować, że operacje faktycznie wykonują się zgodnie z naszymi oczekiwaniami.

W przeciwnym wypadku podnosić alerty, które poinformują zespół deweloperski o problemach w projekcie.

Ale to już opowieść na inny wpis.

PS. Jeśli ten temat (metryk i monitoringu) by Cię interesował, daj znać koniecznie w komentarzu :)


##### Kod źródłowy
> Kod źródłowy powiązany z tym wpisem znajdziesz w [repozytorium na Githubie](https://github.com/sztukakodu/code-examples/tree/master/testing-scheduled)
