---
layout: post
title: Czym jest kontekst Springa i jak uruchamiać go w testach?
description: 
image: https://dummyimage.com/1500x1000/fff/aaa
tags: []
---

Spring w najkrótszej definicji to wielka mapa obiektów. Poprzez wstrzykiwanie zależności framework zajmuje się tworzeniem grafu obiektów za nas. Całość zarządzana jest przez `ApplicationContext`, który jest sercem aplikacji.Dzisiaj artykuł będący odpowiedzią na [pytanie](https://strony.sztukakodu.pl/pytanie) zadane mi przez jednego z czytelników.

> Jak uruchamiana jest aplikacja w Springu? Czym tak naprawdę są i w jakiej kolejności są inicjalizowane `ApplicationContext` i `WebApplicationContext`? Czym się różni `@ContextConfiguration` od `@SpringBootAplication`? Jak się ma do tego `@WebMvcTest`, `@EnableWebMvc` i `@SpringBootTest`?

Zacznijmy więc po kolei.
## Application Context
W momencie startu aplikacji Springa tworzony jest jej kontekst - `ApplicationContext`. To w nim rejestrowane są _beany_, które później używane są przez framework to tworzenia grafu obiektów. Każda aplikacja Springa posiada własny kontekst, minimum (i zazwyczaj) jeden. Spójrzmy na poniższy kod aplikacji w Spring Boocie.

    @SpringBootApplication
    public class MyApplication {
    
        public static void main(String[] args) {
            ApplicationContext context = SpringApplication.run(MyApplication.class, args);
            UsersRepository repository = context.getBean(UsersRepository.class);
        }
    
    }

W metodzie `main` możemy dostać się do kontekstu aplikacji i wykonywać na nim różne operacje - na przykład pobierać zarejestrowane _beany_. Zazwyczaj nie musimy bezpośrednio operować z klasą `ApplicationContext`, ale warto wiedzieć, że ona tam pod spodem jest i zarządza obiektami w naszej aplikacji.
## WebApplicationContext
`WebApplicationContext` oznacza z kolei kontekst aplikacji Springa w środowisku webowym. Mamy z nim do czynienia w momencie, gdy korzystamy z modułów webowych oraz _servletów_. Wówczas domyślny kontekst aplikacyjny zostaje zastąpiony webowym, który jest po prostu jego rozszerzeniem. Dodaje on metodę `getServletContext()`, która zwraca... `ServletContext` ;)

    package org.springframework.web.context;
    
    public interface WebApplicationContext extends ApplicationContext {
      ServletContext getServletContext();
    }

_ServletContext_ natomiast zajmuje się całą obsługą żądań HTTP, które trafiają do aplikacji i sprawia, że aplikacja Springowa może z łatwością pisać, czytać z sieci i obsługiwać wszystkie związane z tym zagadnienia.
## @SpringBootApplication
Co robi adnotacja `@SpringBootApplication`? Niech przemówi dokumentacja:

> This is a convenience annotation that is equivalent to declaring `@Configuration`, `@EnableAutoConfiguration` `@ComponentScan`.

Jest niczym innym jak _aliasem_ nad kilka innych adnotacji. W skrócie - oznaczenie głównej klasy naszej aplikacji adnotacją `@SpringBootApplication` skraca kod i korzystając z podejścia _convention over configuration_ przyśpiesza proces pisania aplikacji. Jeśli powyższe adnotacje nie są dla nas odpowiednie, możemy ręcznie wybrać pożądane ustawienia.
## @EnableWebMvc
Do czego służy adnotacja `@EnableWebMvc`? Importuje ona konfigurację `WebMvcConfigurationSupport`. Można jej użyć, gdy chcemy dodać jakieś specjalne zachowanie do obsługi żądań HTTP w aplikacji.

    @EnableWebMvc
    @SpringBootApplication
    public class MyApplication {
    
        public static void main(String[] args) {
            SpringApplication.run(MyApplication.class, args);
        }
    
    }

Uwaga, w aplikacjach pisanych w **Spring Boot** adnotacja ta **nie jest wymagana** jeśli już korzystamy ze _spring-boot-web-starter_. Dodanie wsparcia dla konfiguracji _WebMvc_ dzieje się automatycznie. Dzięki tej konfiguracji możemy zdefiniować między innymi konwertery dla niestandardowych klas obsługując żądania webowe. Na przykład konwerter _stringów_ w obiekty klasy `Currency`.

    @Configuration
    public class WebConfig implements WebMvcConfigurer {
    
        @Override
        public void addFormatters(FormatterRegistry registry) {
            registry.addConverter(new StringToCurrencyConverter());
        }
    }
    
    public class StringToCurrencyConverter implements Converter<String, Currency> {
    
        @Override
        public Currency convert(String from) {
            // parse string to currency
        }
    }

## @SpringBootTest
Adnotacji `@SpringBootTest` używany w testach gdy chcemy uruchomić **pełny kontener aplikacji**. Oznacza to, że Spring użyje Twojej głównej klasy konfiguracyjnej (np. `MyApplication`) i załaduje wszystkie _beany_ jakie masz zdefiniowane.

    @ExtendWith(SpringExtension.class)
    @SpringBootTest
    @AutoConfigureMockMvc
    class RegisterUseCaseIntegrationTest {
    
      @Autowired
      private MockMvc mockMvc;
    
      @Autowired
      private ObjectMapper objectMapper;
    
      @Autowired
      private UserRepository userRepository;
    
      @Test
      void registrationWorksThroughAllLayers() throws Exception {
        UserResource user = new UserResource("Zaphod", "zaphod@galaxy.net");
    
        mockMvc.perform(post("/forums/{forumId}/register", 42L)
                .contentType("application/json")
                .param("sendWelcomeMail", "true")
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());
    
        UserEntity userEntity = userRepository.findByName("Zaphod");
        assertThat(userEntity.getEmail()).isEqualTo("zaphod@galaxy.net");
      }
    
    }

Daje nam to możliwość stworzenia testów automatycznych, które upewnią nas, że w poprawny sposób wszystko ze sobą połączyliśmy. Testy te będą jednak kosztowne, gdyż będą trwać więcej czasu. Warto jednak mieć kilka takich testów w swojej aplikacji. **Uwaga** - domyślnie `SpringBootTest` stawia wszystkie komponenty Twojej aplikacji ale nie uruchamia pełnego serwera HTTP. Jeśli chcesz przetestować pełny zakres aplikacji musisz podać parametr do adnotacji.

    @RunWith(SpringRunner.class)
    @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
    public class MyApplicationTests {
    
        @Test
        public void contextLoads() {
        }
    
    }

Więcej na ten temat w [dokumentacji](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications).
## @WebMvcTest
Jeśli nie potrzebujemy testować wszystkich modułów aplikacji a tylko interfejs webowy, możemy w tym celu skorzystać z adnotacji `@WebMvcTest`. Sprawia ona, że Spring Boot startuje **jedynie warstwę webową** - bez całego kontekstu aplikacji. Spring przeskanuje klasy oznaczone adnotacją `@RestController`, `@Controller`, i tym podobne, ale nie włączy automatycznie do kontekstu np. klas oznaczonych tylko adnotacją `@Component`. Dzięki temu może przetestować zachowanie kontrolerów aplikacji, sprawdzić czy obiekty poprawnie się parsują oraz zachowują zdefiniowany kontrakt. Takie testy upewnią nas, że interfejs działa poprawnie, a jednocześnie będą trwać mniej czasu niż pełne testy, które uruchamiamy z adnotacją `@SpringBootTest`.

    @RunWith(SpringRunner.class)
    @WebMvcTest
    public class WebLayerTest {
    
        @Autowired
        private MockMvc mockMvc;
    
        @Test
        public void shouldReturnDefaultMessage() throws Exception {
          this.mockMvc.perform(get("/"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("Hello World")));
        }
    }

W testach z `@WebMvcTest` możemy nawet określić który dokładnie kontroler chcemy aby wystartował. Dzięki temu testy powinny być jeszcze szybsze. Jeśli korzystamy z obiektów zależnych musimy je dodatkowo zamockować adnotacją `@MockBean`. W testach z adnotacją `@SpringBootTest` te obiekty byłyby domyślnie stworzone w kontekśćie Springa.

    @RunWith(SpringRunner.class)
    @WebMvcTest(GreetingController.class)
    public class WebMockTest {
    
        @Autowired
        private MockMvc mockMvc;
    
        @MockBean
        private GreetingService service;
    
        @Test
        public void greetingShouldReturnMessageFromService() throws Exception {
           when(service.greet()).thenReturn("Hello Mock");
    
           this.mockMvc.perform(get("/"))
             .andDo(print())
             .andExpect(status().isOk())
             .andExpect(content().string(containsString("Hello World")));
        }
    }

## @ContextConfiguration
Został nam jeszcze do omówienia `@ConfigurationContext`. Jest to adnotacja pochodząca z domyślnej wersji Springa (bez Boota). Służy ona do uruchomienia testów integracyjnych i wskazanie jak kontekst Springa powinien zostać uruchomiony. Tak naprawdę robi więc to samo co `@SpringBootTest` i jeśli pracujemy w świecie _boota_, to nie musimy z niej korzystać.

    @RunWith(SpringRunner.class)
    @SpringBootTest
    @Transactional
    public class UserTest {
    
        @Resource
        UsersRepository usersRepository;
    
        @Test
        public void shouldSaveUserToDb() {
            User user = new User(1L, "Mariusz", LocalDateTime.now());
            Group group = new Group(1L, "Spring Polska", LocalDateTime.now());
            Set<Group> groups = new HashSet<>();
            groups.add(group);
            user.setGroups(groups);
    
            usersRepository.save(user);
    
            User fetched = usersRepository.getOne(1L);
            assertEquals("Mariusz", fetched.getUsername());
            assertEquals(1, fetched.getGroups().size());
        }
    
    }

Adnotacji do testów integracyjnych w Spring Boocie jest dość sporo i jeśli potrzebujesz dokładniej dowiedzieć się jak z nich korzystać [w dokumentacji](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications) znajdziesz ich dość dobry opis.
## Podsumowanie
Po przeczytaniu tego wpisu powinieneś wiedzieć już dużo więcej na temat wnętrzności Springa. Jeśli masz dodatkowe pytania, zostaw je proszę w komentarzu. PS. Jeśli wpis Ci pomógł, podziel się proszę z jedną osobą, dla której może być wartościowy. Dzięki temu będę mógł docierać do kolejnych czytelników.
