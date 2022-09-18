---
layout:	post
title:	Spring REST API – jak zwalidować cały obiekt?
description: Jednym z ważnych elementów warstwy REST-owej aplikacji jest walidacja żądań, które przychodzą. Co jeśli chcemy zwalidować grupę parametrów?
image: /images/znales-ten.jpg
tags: [spring, java, walidacja]
---

Jednym z ważnych elementów warstwy REST-owej aplikacji jest walidacja żądań, które przychodzą. Możemy osiągnąć to w łatwy sposób za pomocą adnotacji z pakietu `javax.validation.constraints` dla pojedynczych atrybutów.

Co jeśli chcemy zwalidować grupę parametrów?

## ConstraintValidator

To, czego potrzebujemy użyć, to `ConstraintValidator`. Z jego pomocą jesteśmy w stanie zbadać całą zawartość obiektu i poinstruować warstwę API serwisu, czy wszystko jest w porządku.

W tym celu potrzebujemy do zależności dodać `hibernate-validator`.

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.1.5.Final</version>
</dependency>
```

Oraz zdefiniować kontroler REST-owy.

```java
@RestController
@RequestMapping("/orders")
class OrderController {

    @PostMapping
    public ResponseEntity<Object> makeAnOrder(@RequestBody @Valid OrderRequest orderRequest, Errors errors) {
        if(errors.hasErrors()) {
            return errorResponse(errors);
        }
        log.info("Faking order for: " + orderRequest);
        return ResponseEntity.ok("It's fine!");
    }
}
```

Zauważ, że `OrderRequest` posiada standardową adnotację `@Valid`.

Jak ona działa?

## Walidacja obiektu

Do walidacji całego obiektu potrzebujemy trzech elementów:

1. samego obiektu :)
2. adnotacji, którą oznaczymy obiekt do walidacji,
3. implementacji `ConstraintValidator`.

Po kolei.

Klasa obiektu może wyglądać tak:

```java
@OrderRequestValid
public record OrderRequest(String name, boolean invoice, String vatNumber) {
}
```

Adnotacja:

```java
@Target({TYPE})
@Retention(RUNTIME)
@Constraint(validatedBy = OrderRequestValidator.class)
@Documented
@interface OrderRequestValid {
    String message() default "Missing VAT number while requesting for an invoice";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

Oraz nasz `Validator`:

```java
class OrderRequestValidator implements ConstraintValidator<OrderRequestValid, OrderRequest> {

    @Override
    public boolean isValid(OrderRequest request, ConstraintValidatorContext constraintValidatorContext) {
        if (request.invoice() && StringUtils.isBlank(request.vatNumber())) {
            return false;
        }
        return true;
    }
}
```

## I to wszystko

Całość zadzieje się już sama.

Dzięki obecności `@Valid` w kontrolerze poprosimy Springa by sprawdził poprawność obiektu.

Obecność kolejnej adnotacji `@OrderRequestValid` na obiekcie uruchomi logikę powiązaną ze wskazanymi w definicji adnotacji walidatorem.

```java
@Constraint(validatedBy = OrderRequestValidator.class)
```

Na końcu odpali się metoda z walidatora, którą możemy dowolnie zaimplementować, tak by spełniała nasze wymagania.

```java
@Override
public boolean isValid(OrderRequest request, ConstraintValidatorContext constraintValidatorContext) {
    if (request.invoice() && StringUtils.isBlank(request.vatNumber())) {
        return false;
    }
    return true;
}
```


## Podsumowanie
W ten sposób możemy przygotować własną logikę dotyczącą zestawu atrybutów, które chcemy walidować podczas przyjmowania żądań do naszego REST API.

PS. Jeśli chcesz otrzywać dostęp do całego kodu źródłowego, zapisz się na newsletter poniżej a otrzymasz go jako bonus :)

