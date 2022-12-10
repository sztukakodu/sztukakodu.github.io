---
layout:	post
title: Producent i Konsument w Javie przy wykorzystaniu kolejki blokującej
description: Poznaj sposób implementacji jednego z klasycznych problemów współbieżności w Javie.
image: /images/producent-konsument.png
tags: [wspolbieznosc, synchronizacja, watki, wielowatkowosc]
---

Poznaj sposób implementacji jednego z klasycznych problemów współbieżności w Javie.

1. W tym przykładzie producent umieszcza elementy w kolejce, a konsument je pobiera.
2. Kolejka blokująca - *BlockingQueue* - zapewnia, że producent się blokuje (czeka) gdy kolejka jest pełna, a konsument gdy kolejka jest pusta.
3. To zapewnia, że producent i konsument nie próbują dodawać lub usuwać elementów z kolejki w tym samym czasie.
4. Co chroni nas przed warunkami wyścigu - *race condition*.

```java
public class ProducerConsumerExample {
    public static void main(String[] args) {
        // kolejka blokująca z 10 elementami
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);

        // utworzenie producenta i konsumenta
        Producer producer = new Producer(queue);
        Consumer consumer = new Consumer(queue);

        // wystartowanie wątków
        new Thread(producer).start();
        new Thread(consumer).start();
    }
}

class Producer implements Runnable {
    private BlockingQueue<Integer> queue;

    public Producer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    public void run() {
        try {
            for (int i = 0; i < 100; ++i) {
                // Wrzuć element na kolejkę
                queue.put(i);
                System.out.println("Produced: " + i);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Consumer implements Runnable {
    private BlockingQueue<Integer> queue;

    public Consumer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    public void run() {
        try {
            for(int i = 0; i < 100; ++i) {
                // Pobierz element z kolejki
                int item = queue.take();
                System.out.println("Consumed: " + item);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

Oraz wynik z działania programu.

```
Produced: 0
Consumed: 0
Produced: 1
Consumed: 1
Produced: 2
Consumed: 2
Produced: 3
Consumed: 3
Produced: 4
Consumed: 4
Produced: 5
Consumed: 5
Produced: 6
Consumed: 6
Produced: 7
Consumed: 7
Produced: 8
Consumed: 8
Produced: 9
Consumed: 9
Produced: 10
Consumed: 10
Produced: 11
Consumed: 11
Produced: 12
Consumed: 12
Produced: 13
Consumed: 13
Produced: 14
Consumed: 14
Consumed: 15
Produced: 15
Produced: 16
Produced: 17
Produced: 18
Produced: 19
Consumed: 16
Consumed: 17
Consumed: 18
Consumed: 19
```