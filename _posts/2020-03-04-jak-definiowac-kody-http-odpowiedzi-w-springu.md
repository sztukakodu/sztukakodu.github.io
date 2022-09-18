---
layout: post
title: Jak definiować kody HTTP odpowiedzi w Springu?
description: 
image: /images/kody-http.jpg
tags: [spring, http, rest, api]
---

Czy zdarzyło Ci się otrzymać odpowiedź HTTP z kodem 200 OK i wiadomością: `Ooops, something went wrong`? Jeśli tak, wiesz jaki to ból. Jeśli programujesz w Springu i nie chciałbyś sprawiać podobnej przykrości innym osobom, ten wpis jest dla Ciebie! Poznaj sposoby definiowania kodów odpowiedzi w swoich kontrolerach.

## 1. Brak ustawienia kodu - TEGO NIE RÓB!
Zacznijmy od przykładowej implementacji kontrolera REST-owego. W poniższym przykładzie aplikacja nie definuje jakie kody HTTP powinny być zwrócone z poszczególnych metod. W związku z tym każda z nich zwróci kod 200 - jeśli nie dojdzie do pojawienia się jakiegoś wyjątku w trakcie przetwarzania żądania. Oczywiście można tak robić, ale po co? Każda z metod powinna zwracać kod odpowiadający statusowi żądania. W związku z tym poniższe rozwiązanie nie jest tym, które powinieneś powtarzać w swoim kodzie.

    @RequestMapping("/api/tasks")
    @RestController
    class TasksController {
        private final TasksService tasksService;
    
        @GetMapping("/{id}")
        public Task getTaskById(@RequestParam("id") Long id) {
            return tasksService.findById(id);
        }
    
        @PostMapping("/")
        public void createTask(@RequestBody Task task) {
            tasksService.createTask(task);
        }
    
        @GetMapping
        public List<Task> getTasks() {
            return tasksService.findAll();
        }
    
        @DeleteMapping("/{id}")
        public void deleteTask(@RequestParam("id") Long id) {
            tasksService.deleteById(id);
        }
    }

## 2. Klasa ResponseEntity
Rozwiązaniem powyższej sytuacji jest wprowadzenie klasy `ResponseEntity`. Z jej pomocą możemy łatwo zdefiniować jaki status HTTP powinien być zwrócony. Oprócz standardowej metody `status()` pozwalającej na zdefiniowanie konkretnego kodu, możemy także skorzystać z pomocniczych metod jak `ok()`, `badRequest()` czy `notFound()`.

    @RequestMapping("/api/tasks")
    @RestController
    class TasksController {
        private final TasksService tasksService;
    
        @GetMapping("/{id}")
        public ResponseEntity getTaskById(@RequestParam("id") Long id) {
            return ResponseEntity.ok(tasksService.findById(id));
        }
    
        @PostMapping("/")
        public ResponseEntity createTask(UriComponentBuilder builder, @RequestBody Task task) {
            Long taskId = tasksService.createTask(task).getId();
            UriComponents uriComponents = builder.path("/customers/{id}").buildAndExpand(taskId);
            return ResponseEntity.created();
        }
    
        @GetMapping
        public ResponseEntity getTasks() {
            return ResponseEntity.ok(tasksService.findAll());
        }
    
        @DeleteMapping("/{id}")
        public ResponseEntity deleteTask(@RequestParam("id") Long id) {
            try {
                tasksService.deleteById(id);
                return ResponseEntity.noContent();
            } catch (TaskNotFoundException e) {
                return ResponseEntity.notFound();
            }
        }
    }

## 3. Adnotacja @ResponseStatus
W Springu istnieje jeszcze adnotacja `@ResponseStatus`, którą możemy zdefiniować nad metodą. Jest to pomost pomiędzy sposobem pierwszym a drugim. Z jednej strony zyskujemy możliwość definiowania kodów odpowiedzi, ale z drugiej te kody są statyczne i dana metoda nie może zwrócić innego kodu. W takim wypadku na poziomie kontrolera nie możemy odróżnić czy metoda powinna zwracać kod 201 czy 204.

    @RequestMapping("/api/tasks")
    @RestController
    class TasksController {
        private final TasksService tasksService;
    
        @GetMapping("/{id}")
        @ResponseStatus(200)
        public Task getTaskById(@RequestParam("id") Long id) {
            return tasksService.findById(id);
        }
    
        @PostMapping("/")
        @ResponseStatus(201)
        public void createTask(Task task) {
            tasksService.createTask(task);
        }
    
        @GetMapping
        @ResponseStatus(200)
        public List<Task> getTasks() {
            return tasksService.findAll();
        }
    
        @DeleteMapping("/{id}")
        @ResponseStatus(204)
        public void deleteTask(@RequestParam("id") Long id) {
            tasksService.deleteById(id);
        }
    }

> Psst... Mam nadzieję, że masz już mój ebook o [10 sztuczkach senior developerów w Springu](/ebook)? ☘️

## 4. @ExceptionHandler
W ciele kontrolera możemy umieścić też specjalne metody odpowiedzialne za obsługę wyjątków. Wystarczy zdefiniować specjalne metody z adnotacją `@ExceptionHandler`, w której definiujemy które wyjątki powinny łapać. W ten sposób na poziomie pojedynczego kontrolera możemy zdefiniować specjalne `handlery`.

    @RequestMapping("/api/tasks")
    @RestController
    class TasksController {
        // ..
    
        @ExceptionHandler(TaskNotFoundException.class)
        public final ResponseEntity<Error> handleException(TaskNotFoundException ex) {
            HttpHeaders headers = new HttpHeaders();
            HttpStatus status = HttpStatus.NOT_FOUND;
            TaskNotFoundException tne = (TaskNotFoundException) ex;
            return ResponseEntity.status(status);
        }
    
        @ExceptionHandler(UnauthorizedException.class)
        public final ResponseEntity<Error> handleException(UnauthorizedException ex) {
            HttpHeaders headers = new HttpHeaders();
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            UnauthorizedException ue = (UnauthorizedException) ex;
            return ResponseEntity.status(status);
        }
    }

## 5. @ControllerAdvice
Definiowanie _exception handlerów_ wewnątrz wszystkich kontrolerów może być uciążliwe. Większość wyjątków - jak `UnauthorizedException`, czy `UserNotFoundException` chcemy obsłużyć w ten sam sposób. Dlatego rozwiązaniem jest globalny \*Exception Handler&, który zajmie się obsługą wyjątków z wszystkich kontrolerów. Wystarczy zdefiniować następującą klasę:

    @ControllerAdvice
    class ApiExceptionHandler {
    
        @ExceptionHandler({ UnauthorizedException.class, TaskNotFoundException.class })
        public final ResponseEntity<ApiError> handleException(Exception ex, WebRequest request) {
            HttpHeaders headers = new HttpHeaders();
            if (ex instanceof UnauthorizedException) {
                HttpStatus status = HttpStatus.NOT_FOUND;
                UnauthorizedException ue = (UnauthorizedException) ex;
    
                return handleUserNotFoundException(ue, headers, status, request);
            } else if (ex instanceof TaskNotFoundException) {
                HttpStatus status = HttpStatus.BAD_REQUEST;
                TaskNotFoundException tnfe = (TaskNotFoundException) ex;
    
                return handleContentNotAllowedException(tnfe, headers, status, request);
            } else {
                HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
                return handleExceptionInternal(ex, null, headers, status, request);
            }
        }
    
    }

Dzięki niej popularne błędy możemy rozwiązywać w jednym miejscu. Oczywiście można łączyć te metody - `@ControllerAdvice` z `@ExceptionHandler-em` wewnątrz klasy. Wówczas definicja z klasy ma wyższy priorytet.
## 6. ResponseStatusException
Istnieje jeszcze jeden sposób definiowania zwracanego kodu HTTP w przypadku pojawienia się wyjątku w naszym kodzie. W Springu 5 pojawił się nowy typ wyjątku - `ResponseStatusException`, który możemy rzucić z ciała naszej metody.

    @DeleteMapping("/{id}")
    @ResponseStatus(204)
    public void deleteTask(@RequestParam("id") Long id) {
        try {
            tasksService.deleteById(id);
        } catch (TaskNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Provide correct task ID", ex);
        }
    }

`ResponseStatusException` zostanie przechwycony i obsłużony już przez samego Springa zwracając ładnie sformatowaną i przygotowaną odpowiedź z odpowiednim kodem.

    {
        "timestamp": "2020-02-04T00:08:11.432+0000",
        "status": 404,
        "error": "Not Found",
        "message": "Provide correct task ID",
        "path": "/api/tasks/42"
    }

## Podsumowanie
Przez lata w Springu pojawiło się wiele narzędzi do definiowania odpowiednich statusów HTTP z REST kontrolerów. Najważniejsza lekcja z tego wpisu to nauczyć się jak ich używać i dbać o to, by były one określone zgodnie z ich przeznaczeniem. Nikt nie lubi otrzymywać odpowiedzi z kodem 200 i treścią "Oops, something went wrong" ;).
