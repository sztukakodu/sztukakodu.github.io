---
layout:	post
title:	Jak szybko uruchamiam kontenery Dockerowe z fzf?
description: Podczas pracy z wieloma projektami może nam być trudno nawigować po wszystkich katalogach by łatwo lokalizować pliki, które chcemy uruchomić.
image: /images/mojtrick.jpg
tags: [docker, produktywność, terminal]
---

Podczas pracy z wieloma projektami może nam być trudno nawigować po wszystkich katalogach by łatwo lokalizować pliki, które chcemy uruchomić.
Przykładem może być uruchamianie kontenerów Dockerowych z różnych projektów z poleceniem `docker compose`.

Musimy albo być w katalogu, z którego plik `docker-compose.yml` chcemy uruchomić, albo za każdym razem podać pełną ścieżkę z przełącznikiem `--file`.
Niestety, nie jest to za wygodne.

Na szczęście z pomocą przychodzi aplikacja konsolowa [fzf - fuzzy finder](https://github.com/junegunn/fzf), dzięki której całość staje się przyjemnością.

### Jak to działa?

Spójrz na poniższą komendę.

```shell
$ docker compose --file $(fzf) up -d
```

Za jej pomocą przekazujemy wynik działania programu `fzf` jako ścieżkę pliku `docker-compose.yml`.
W czym to pomaga?

A no w tym, że odpalająć `fzf` możemy łatwo zlokalizować pliki `docker-compose.yml` wpisując tylko kilka znaków.
`fzf` wylistuje nam wszystkie pasujące, które możemy zawężać kolejnymi znakami, aż w końcu wybrać za pomocą strzałek i entera :)


Jeśli dodatkowo dodamy sobie do naszej powłoki alias:

```
alias dc="docker compose"
```

Wówczas całość skraca się do wygodnego:

```shell
$ dc --file $(fzf) up -d
```

Warto też wspomnieć, że mając zainstalowane `fzf` możemy wracać do historycznych komend w łatwy sposób wciskająć w terminalu `ctrl+r`.

Dzięki temu nasza praca z terminalem i dockerem może być o wiele łatwiejsza :)
