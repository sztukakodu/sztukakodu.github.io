---
layout:	post
title: Git - Jak korzystać z wielu kont na jednym komputerze?
description: 
image: /images/1500x1000.png
tags: [git, narzedzia, terminal]
---


### ~/.gitconfig

```bash
[includeIf "gitdir:~/git/apache/"]
	path = ~/git/apache/.gitconfig

[includeIf "gitdir:~/git/darek1024/"]
	path = ~/git/darek1024/.gitconfig
```

### ~/.ssh

```bash
❯ ssh-keygen -t rsa -C "dmydlarz@apache.org"
❯ ssh-keygen -t rsa -C "darek1024@gmail.com" -f github-darek1024
```

### Struktura folderu `.ssh`

```
❯ ls ~/.ssh
config   github-darek1024.pub   github-darek1024   id_rsa.pub   id_rsa
```

### Plik `.ssh/config`

```bash
❯ cat ~/.ssh/config

# Apache (dmydlarz) account
Host github.com-apache
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa

# Personal (darek1024) account
Host github.com-darek1024
    HostName github.com
    User git
    IdentityFile ~/.ssh/github-darek1024
```

---

I ostatecznie dedykowane pliki `.gitconfig` w odpowiednich katalogach

### ~/git/apache/.gitconfig

```conf
[user]
  email = dmydlarz@apache.org
  name = Darek Mydlarz
```


### ~/git/darek1024/.gitconfig

```conf
[user]
  email = darek1024@gmail.com
  name = Darek Mydlarz
```

---

### Checkout projektu

```bash
$ git clone git@github.com-darek1024:sztukakodu/code-examples.git
$ git remote -v
origin	git@github.com-personal:sztukakodu/code-examples.git (fetch)
origin	git@github.com-personal:sztukakodu/code-examples.git (push)
````

Apache

```bash
$ git clone git@github.com:apache/kafka.git
$ git remote -v
origin	git@github.com:apache/kafka.git (fetch)
origin	git@github.com:apache/kafka.git (push)
````