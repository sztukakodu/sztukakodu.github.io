---
layout:	post
title: 
description: 
image: /images/1500x1000.png
tags: []
---

```java
@Slf4j
@AllArgsConstructor
public class RestLoggingInterceptor implements ClientHttpRequestInterceptor {

	private final Predicate<HttpRequest> predicate;

	@Override
	public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
		if(log.isInfoEnabled() && predicate.test(request)) {
			log.info("Making API Call: {} {}", request.getMethod(), request.getURI());
		}
		return execution.execute(request, body);
	}
}
```


```java
	private void addInterceptors(RestTemplate restTemplate) {
		log.info("Requests debug enabled: {}", properties.debug());
		if(properties.debug()) {
			List<ClientHttpRequestInterceptor> interceptors = restTemplate.getInterceptors();
			if (CollectionUtils.isEmpty(interceptors)) {
				interceptors = new ArrayList<>();
			}
			Predicate<HttpRequest> isMatchingRequest = request -> StringUtils.containsIgnoreCase(request.getURI().toASCIIString(), properties.baseUrl());
			interceptors.add(new RestLoggingInterceptor(isMatchingRequest));
			restTemplate.setInterceptors(interceptors);
		}
	}
```


```yaml
thirdPartyService:
  debug: true
```