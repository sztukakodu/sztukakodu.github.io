---
layout:	post
title: Producent i Konsument w Javie przy wykorzystaniu kolejki blokującej
description: Poznaj sposób implementacji jednego z klasycznych problemów współbieżności w Javie.
image: /images/1500x1000.png
tags: [wspolbieznosc, synchronizacja, watki, wielowatkowosc]
---

Poznaj sposób implementacji jednego z klasycznych problemów współbieżności w Javie.

W tym przykładzie, Producent umieszcza elementy w kolejce, a Konsument je pobiera. BlockingQueue zapewnia, że producent blokuje (czeka) gdy kolejka jest pełna, a konsument blokuje gdy kolejka jest pusta. To zapewnia, że producent i konsument nie próbują dodawać lub usuwać elementów z kolejki w tym samym czasie, co może prowadzić do warunków wyścigu (ang. race condition).

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class ProducerConsumerExample {
    public static void main(String[] args) {
        // Create a blocking queue with a capacity of 10 items
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);

        // Create a producer and a consumer
        Producer producer = new Producer(queue);
        Consumer consumer = new Consumer(queue);

        // Start the producer and the consumer
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
            for (int i = 0; i < 100; i++) {
                // Put the item on the queue
                queue.put(i);
                System.out.println("Produced item: " + i);
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
            while (true) {
                // Take an item from the queue
                int item = queue.take();
                System.out.println("Consumed item: " + item);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```