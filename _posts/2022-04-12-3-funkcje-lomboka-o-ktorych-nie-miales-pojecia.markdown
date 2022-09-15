---
layout: post
title: 3 Funkcje Lomboka, O Których Nie Miałeś Pojęcia
description: Lombok to jedna z najczęściej używanych bibliotek w Javie. Pozwala zaoszczędzić czas (i pieniądze!) programisty. Poznaj te, o których nie każdy wie!
date: 2022-04-12 12:24:35 +0200
image: /images/niewiedziales.jpg
tags: [lombok, java, spring]
---

Zdradzę Ci sekret.

Lomboka używam w każdym projekcie w Javie, z jakim mam styczność.

W każdym!

Zakładam, że Ty pewnie też.

Adnotacje `@Data`, `@Value` czy `@RequiredArgsConstructor` zaoszczędzają mi mnóstwo czasu.


Ale to nie wszystkie funkcje, jakie skrywa w sobie Lombok.

Zobacz 3 ciekawe możliwości, o których być może nie miałeś do tej pory pojęcia!

# 1. Sneaky Throws

Adnotacja, dzięki której nie muszę deklarować `CheckedExceptions`, których i tak nie chcę w żaden sposób obsługiwać.

Albo gdy muszę zaimplementować interfejs, który nie deklaruje rzucania wyjątkami.

W takich sytuacjach sprawdza się znakomicie.

Przed korzystaniem z tej adnotacji kod może wyglądać tak.

```java
class CustomerService {

  private ObjectMapper mapper;

  public Customer parseJson(String json) throws JsonParsingException {
      return mapper.readValue(json, Customer.class);
  }
}
```

Natomiast po dodaniu `@SneakyThrows` nie ma potrzeby pisać `throws JsonParsingException`.

```java
class CustomerService {

  private ObjectMapper mapper;

  @SneakyThrows
  public Customer parseJson(String json) {
      return mapper.readValue(json, Customer.class);
  }
}
```

Dzięki temu klient klasy `CustomerService` nie musi przejmować się obsługą wyjątku w metodzie `parseJson`, którego i tak nie chciałby w żaden sposób obsłużyć.


# 2. Cleanup

Umówmy się.

Java powstała już jakiś czasu.

I nie każda konstrukcja języka jest przyjemna do czytania.

Jak, na przykład, zamykanie zasobów implementujących interfejs `AutoClosable`.

Przed Javą 7 wyglądało to tak:

```java
public Customer parseFromFile(String file) {
  Customer customer = null;
  InputStream stream = new FileInputStream("foo.txt")
  try {
    customer = mapper.readValue(stream, Customer.class);
  } finally {
    stream.close();
  }
  return customer;
}
```

Od Javy 7 kwestia trochę się poprawiła.

Można wkładać zasób do bloku try-catch.

A ten zamknięty zostanie automatycznie.

```java
public Customer parseFromFile(String file) {
  Customer customer = null;
  try (InputStream stream = new FileInputStream("foo.txt")) {
    customer = mapper.readValue(stream, Customer.class);
  }
  return customer;
}
```

Ale czy można lepiej?

Oczywiście!

Z pomocą przychodzi `Cleanup` z Lomboka :)

```java
@SneakyThrows
public Customer parseFromFile(String file) {
  @Cleanup InputStream stream = new FileInputStream(file);
  return mapper.readValue(stream, Customer.class);
}
```

Zamiast 5 linii mamy 2! :) 

# 3. Lazy Getter

Jak zaimplementować mechanizm leniwego inicjalizowania zmiennej?

Musimy podciągnąć rękawy, ubrudzić ręce i napisać taki smutny kodzik 👇


```java
class Rates {
  private Map<String, BigDecimal> rates = new HashMap<>();
  private static final Object FETCH_LOCK = new Object();

  public Map<String, BigDecimal> getRates() {
    if(rates == null) {
      synchronized(FETCH_LOCK) {
        if(rates == null) {
          rates = fetchRates();
        }
      }
    }
    return rates;
  }

  private Map<String, BigDecimal> fetchRates() {
    // make a long HTTP call
  }
}
```
*(Wzorzec podwójnie sprawdzanego blokowania - ang. double-checked locking)*


17 linii i całkiem spore pole do popełnienia błędu..

A jak to wygląda z Lombokiem?

Dodajmy adnotację `@Getter(lazy = true)`.

```java
class Rates {
  @Getter(lazy = true)
  private final Map<String, BigDecimal> rates = fetchRates();

  private Map<String, BigDecimal> fetchRates() {
    // make a long HTTP call
  }
}
```

6 lini!

I ten sam efekt.

Skoro nie widać różnicy, to po co przepłacać? :)

...no chyba, że masz płacone za liczbę linii kodu...

Ale to już temat na inną rozmowę 😅

# Szybkie podsumowanie.

1. Lombok jest zajebisty.
2. Adnotacje @Value, @Data czy @RequiredArgsConstructor zna większość programistów.
3. Ale stosowanie innych konstrukcji jak: `@SneakyThrows`, `@Cleanup` czy `@Getter(lazy = true)` może wznieść Twój kodzik na jeszcze wyższy poziom.

A Ty? Znałeś te adnotacje? :)