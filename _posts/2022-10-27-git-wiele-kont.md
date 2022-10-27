---
layout:	post
title: Git - Jak korzystać z wielu kont na jednym komputerze?
description: W tym wpisie pokażę Ci jak korzystać z wielu kont Gita na jednym komputerze.
image: /images/git-wiele-kont.png
tags: [git, narzedzia, terminal]
---

W tym wpisie pokażę Ci jak korzystać z wielu kont Gita na jednym komputerze.

Początkowa konfiguracja wymaga kilku kroków, ale później korzystanie z wielu kont staje się transparentne. 


### 1. Zacznij od pliku `~/.gitconfig`.

W tym miejscu definiujesz w jakich katalogach, chcesz korzystać, z której konfiguracji.

Przykładowo załóżmy, że masz dwa konta:

1. do pracy z projektami `apache` - w katalogu `~/git/apache`,
2. z projektami prywatnymi - w katalogu `~/git/darek1024`.

Wypełnij wtedy plik `~/.gitconfig` jak poniżej.

```bash
[includeIf "gitdir:~/git/apache/"]
	path = ~/git/apache/.gitconfig

[includeIf "gitdir:~/git/darek1024/"]
	path = ~/git/darek1024/.gitconfig
```


### 2. Dedykowane pliki `.gitconfig` dla każdego konta.

Teraz utwórz wskazane w powyższej konfiguracji pliki `.gitconfig`.

`~/git/apache/.gitconfig` z Twoim kontem używanym dla projektów *Apache*.

```conf
[user]
  email = dmydlarz@apache.org
  name = Darek Mydlarz
```

`~/git/darek1024/.gitconfig` z kontem używanym dla Twoich prywatnych projektów.

```conf
[user]
  email = darek1024@gmail.com
  name = Darek Mydlarz
```

### Brawo. Połowa sukcesu za nami.

Możesz już korzystać z konfiguracji różnych kont w różnych katalogach, ale to tylko połowa sukcesu.

To, co chcemy osiągnąć, to automatyczne uwierzytelnianie Ciebie w zależności od katalogu, w którym pracujesz.


### 3. Wygeneruj osobne klucze dla obu kont

Będziemy potrzebować osobnych kluczy SSH, które umieścisz na serwerze Gita - np. GitHubie w odpowiednim koncie.

Aby wygenerować dwie osobne pary kluczy, odpal poniższe komendy.

Przełącznik `-f` pozwala zdefiniować Ci nazwę pliku, który się wygeneruje.

```bash
❯ ssh-keygen -t rsa -C "dmydlarz@apache.org"
❯ ssh-keygen -t rsa -C "darek1024@gmail.com" -f github-darek1024
```

### 4. Sprawdź strukturę folderu `.ssh`

W efekcie, powinieneś widzieć następujące pliki w katalogu `~/.ssh`.

```
❯ ls ~/.ssh
config   github-darek1024.pub   github-darek1024   id_rsa.pub   id_rsa
```

Zwróć uwagę na pary plików:

* `id_rsa`  - dla konta `dmydlarz@apache.org`
* `github-darek1024` - dla konta `darek1024@gmail.com`

Teraz musisz wykorzystać je w pliku `~/.ssh/config`


### 5. Konfiguracja w pliku `.ssh/config`

W tym miejscu definiujesz, które klucze mają być wykorzystywane dla jakich hostów.

* klucz `id_rsa` dla hosta `github.com-apache`,
* klucz `github-darek1024` dla hosta `github.com-darek1024`.

```bash
❯ cat ~/.ssh/config

# Apache (dmydlarz@apache.org) account
Host github.com-apache
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa

# Personal (darek1024@gmail.com) account
Host github.com-darek1024
    HostName github.com
    User git
    IdentityFile ~/.ssh/github-darek1024
```

Za chwilę wyjaśni się jak z tych hostów korzystać. 👇


### 6. Walidacja konfiguracji dla konta `darek1024@gmail.com`.

Aby pobrać projekt dla konta `darek1024@gmail.com` przy klonowaniu podaj jako host `github.com-darek1024`.

Na przykład: `git@github.com-darek1024:sztukakodu/code-examples.git`

```bash
$ git clone git@github.com-darek1024:sztukakodu/code-examples.git
#                         ^^^^^^^^^^ - extra suffix
````

Wystarczy zawołać to raz, przy klonowaniu projektu.

Potem korzystasz już normalnie z komend `push`, `pull` i `commit`.


### 7. Korzystanie z konta `dmydlarz@apache.org`

Tutaj możemy korzystać na dwa sposoby.

1. Klonując projekt i podając host `github.com-apache`

```bash
$ git clone git@github.com-apache:apache/kafka.git
```

2. Lub podając domyślnego hosta.

```bash
$ git clone git@github.com:apache/kafka.git
```

Sposób nr 2 zadziała dlatego, że wykorzystany zostanie domyślny plik `id_rsa`.

### To wszystko.

Daj znać, czy udało Ci się odpowiednio skonfigurować kilka kont na swojej maszynie i czy korzystasz już z tego sposobu.

Pozdrawiam!