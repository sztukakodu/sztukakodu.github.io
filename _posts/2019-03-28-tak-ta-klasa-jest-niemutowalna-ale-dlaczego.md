---
layout: post
title: Tak, ta klasa jest niemutowalna. Ale dlaczego?
description: 
image: /images/immutable.jpg
tags: [java, design, wzorce]
---

Czy klasa, która zwraca różne wartości może być niemutowalna? Wydawało by się, że nie, ale ja uważam, że tak. I w tym wpisie cię do tego przekonam.

Zacznijmy od tego, czym jest klasa niemutowalna - *ang. immutable*. Jest to klasa, której zmienne instancyjne mogą zostać ustawione tylko raz i nie mogą być modyfikowane.
Jakiś czas temu [Yegor Bugayenko](https://twitter.com/yegor256/status/1097056700517863424) opublikował poniższy fragment kodu na Twitterze z pytaniem czy zaprezentowana klasa jest niemutowalna.

```java
final class Book {
    private final Path path;

    Book(Path path) {
        this.path = path;
    }
    
    public String content() {
        return new String(Files.readAllBytes(this.path));
    }
}
```

45% osób uznało powyższą klasę za mutowalną. Ja i 26% innych respondentów oznaczyliśmy ją jako niemutowalną. Dlaczego?

**Klasy niemutowalne mają dwie konsekwencje**. Pierwsza, o której już wspominałem, to brak możliwości modyfikowania jej parametrów. Druga - klasy te są bezpieczne wielowątkowo. Oznacza to, że można je bez obaw współdzielić w wielu wątkach, bez konieczności synchronizacji.

## Czy klasa Book spełnia te założenia? Jak najbardziej.
Zmienna instancyjna `path` nie może być zmodyfikowana po inicjalizacji w konstruktorze - w klasie nie ma żadnych metod ją modyfikujących. Klasę tę można swobodnie przekazywać w środowiskach wielowątkowych. Żaden wątek nie ma mechanizmu by zmienić wewnętrzny stan klasy Book.

Dlaczego więc wiele osób twierdzi, że ta klasa nie jest niemutowalna? Ponieważ metoda `Book.content()` nie zwraca stałej wartości. Jest to jednak błędne podejście i nie ma żadnego związku z niemutowalnością. To, że klasa zwraca różne odpowiedzi nie oznacza, że nie może być ona niemutowalna. **Brak możliwości zmiany jej stanu** jest jedynym i kluczowym warunkiem uznania klasy za taką.

Dla ćwiczenia porównaj poniższe klasy. Którą z nich uznałbyś za niemutowalną? `LazyWebsite` czy `EagerWebsite`?
 
```java
class LazyWebsite {
    private final String url;

    Website(String url) {
        this.url = url;
    }

    public String content(HttpClient client) {
        client.fetch(url);
    }
}

class EagerWebsite {
    private final String content;

    Website(String url, HttpClient client) {
        this.content = client.fetch(url);
    }

    public String content() {
        return content;
    }
}
```

Prawda jest taka, że obie te klasy są niemutowalne. Mają po prostu inną charakterystykę. Jedna pobiera zawartość strony w momencie zawołania metody `content()`, a druga robi to już w konstruktorze.
Zarówno jednak w pierwszym jak i drugim przypadku nie ma możliwości zmiany wartości zmiennych instancyjnych - `url` i `content` - co czyni obie klasy, klasami niemutowalnymi.

A Ty co myślisz o tym argumentowaniu? Daj znać w komentarzu!
