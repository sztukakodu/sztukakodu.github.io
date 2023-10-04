---
layout:	post
title: 
description: 
image: /images/1500x1000.png
tags: []
---

```gradle
plugins {
    id 'org.springframework.boot' version '2.6.5'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

group = 'io.softr'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2021.0.4"
    }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    // starter-zipkin
    implementation 'org.springframework.cloud:spring-cloud-starter-sleuth'
    implementation 'org.springframework.cloud:spring-cloud-starter-zipkin:2.2.8.RELEASE'
    // Server
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```