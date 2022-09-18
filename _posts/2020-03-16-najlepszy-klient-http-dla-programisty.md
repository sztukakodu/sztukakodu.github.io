---
layout: post
title: Najlepszy klient HTTP dla programisty
description: 
image: /images/ideahttp.jpg
tags: [http, narzedzia, intellij]
---

Dzisiaj mam dla Ciebie wpis, który odmieni Twoje developerskie życie.Jeśli korzystasz z IntelliJ IDEA Ultimate (a powinieneś, jeśli szanujesz swój czas i pracodawcy), to mam do Ciebie prośbę. Utwórz plik `requests.http` w katalogu `dev` Twojego projektu. Wpisz do niego:

    # plik: requests.http
    GET https://jsonplaceholder.typicode.com/todos/1

Po lewej pojawi się ikona do uruchomienia. Bum! Właśnie uruchomiłeś najlepszego klienta HTTP - i w dodatku miałeś go pod ręką. Ale po co wołać obce API, jak można swoje? Otóż to. Czasami potrzebujesz sprawdzić coś ręcznie, więc wystarczy, że wpiszesz odpowiednie zapytania do pliku `requests.http` i możesz:
- wykonywać je wielokrotnie,
- trzymać ich historię w repozytorium (!),
- współdzielić z innymi członkami zespołu,
- przestać kolejny raz szukać requestów w Postmanie czy w historii komend `curl`.
Co jeszcze potrafi klient HTTP? Sprawdź sam tworząc plik `http-client.env.json`

    {
        "dev": {
            "api": "http://localhost:8080/api",
            "user": "",
            "password": ""
        },
        "staging": {
            "api": "https://staging.sztukakodu.pl/api",
            "user": "",
            "password": ""
        },
        "production": {
            "api": "https://strony.sztukakodu.pl/api",
            "user": "",
            "password": ""
        }
    }

Oraz plik `http-client.private.env.json` (tylko pamiętaj aby dodać go do swojego `.gitignore`), w którym możesz trzymać hasła do swoich usług:

    {
        "dev": {
            "user": "john",
            "password": "secret123"
        },
        "staging": {
            "user": "john",
            "password": "secret123"
        },
        "production": {
            "user": "admin",
            "password": "cantTellYou"
        }
    }

Teraz requesty w pliku `requests.http` możesz definiować z użyciem propertiesów:

    GET {{api}}/admin/users
    Authorization: Basic {{user}} {{password}}
    Content-Type: application/json

Odpalając żądanie w IntelliJ-u, wybierasz które propertiesy powinien użyć&nbsp;(dev, staging lub production). ![](https://strony.sztukakodu.pl/wp-content/uploads/2019/12/http-client1.png)Mało? Spróbuj wkleić do pliku `requests.http` Twoje żądanie `curl` z historii komend. Lub z narzędzi developerskich Chrome (`Copy` \> `Copy as curl`). Jeszcze mało? Możesz zapisać dane z odpowiedzi do późniejszego ich używania w kolejnych requestach (np. dane autoryzacyjne).

```
POST https://httpbin.org/post
Content-Type: application/json

{
    "token": "my-secret-token"
}

# Zapisz token w zmiennnej "auth_token"
> {\%
    client.global.set("auth_token", response.body.json.token);
\%}

###
# Wykorzystaj zapisaną zmienną w kolejnych żądaniach
GET https://httpbin.org/headers
Authorization: Bearer {{auth_token}}
```

Oczywiście nie musisz ograniczać się do jednego pliku `requests.http`. Możesz stworzyć logiczne pliki na poszczególne elementy aplikacji, pliki na żądania do zewnętrznych serwisów, czy do przeglądania logów, albo metryk. Pełna dowolność, a przy tym możliwość trzymania żądań w historii Gita, łatwe odpalanie na wielu środowiskach i wygodne opcje konwersji z dotychczasowych narzędzi (curl, Postman czy Chrome). Dla mnie to narzędzie jest jednym z największych odkryć IntelliJ-a ostatnich miesięcy i bardzo zmieniło wygodę mojej pracy. Jeśli jeszcze z niego nie korzystasz, czas najwyższy zacząć! Potrzebujesz więcej informacji? Kliknij [tu](https://blog.jetbrains.com/phpstorm/2018/04/handling-reponses-in-the-http-client/), [tu](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) albo [tu](https://www.jetbrains.com/help/idea/http-response-handling-examples.html).
