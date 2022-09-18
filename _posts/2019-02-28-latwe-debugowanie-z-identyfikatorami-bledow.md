---
layout: post
title: Łatwe debugowanie z identyfikatorami błędów
description: 
image: /images/ladybug.jpg
tags: [debugowanie, craftsmanship, testowanie]
---

Debugowanie aplikacji to jedna z najważniejszych umiejętności programisty. To frustrujące, gdy trudno jest nam odnaleźć błąd w logach aplikacji. Ogromnym ułatwieniem może być generowanie unikalnych identyfikatorów występujących błędów.Niedawno odkryłem ciekawą technikę. Otóż za każdym razem, kiedy aplikacja webowa generuje niespodziewany błąd do jej odpowiedzi dodawany jest unikalny identyfikator. Więc jeśli do tej pory odpowiedź na żądanie wyglądała w taki sposób:

    HTTP/1.1 500
    
    {
      "error": {
        "message": "Something went wrong"
      }
    }

To po wprowadzeniu globalnego _handlera_ niespodziewanych błędów odpowiedź wygląda następująco:

    HTTP/1.1 500
    
    {
      "error": {
        "message": "Something went wrong",
        "errorId": "e319a891-1bb6-4c6b-b28e-2f7b57df29b1"
      }
    }

Wartość pola _errorId_ to wygenerowany automatycznie kod [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). Jednocześnie w logach aplikacji umieszczamy dużo więcej szczegółów dotyczących otrzymanego błędu.

    { "message": "Something went wrong", 
    "errorId": "e319a891-1bb6-4c6b-b28e-2f7b57df29b1", 
    "details": "Circuit opened at https://api.fb.com/graph/people/8313",
    "stackTrace": "...", 
    "userId": 873123, 
    "timestamp": "2019-02-28T06:25:36+0000"}

Teraz podczas testowania naszej aplikacji, czy nawet uruchamiania na produkcji w bardzo łatwy sposób jesteśmy w stanie powiązać odpowiedź z serwera webowego ze szczegółami błędu w logach. Warto w taki sposób traktować wszystkie niestandardowe błędy, które pojawiają się w naszej aplikacji. Dzięki temu możemy szybciej je namierzyć. A Ty co myślisz o tym podejściu? Jak radzisz sobie z tego typu błędami?
