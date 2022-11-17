<div class="grid__box__3 testimonal" markdown="1">

> {{ row["heading"] }}

{{ row["text"] }}

{% if row["image"] %}
<img src="/images/{{ row["image"] }}" />
{% endif %}
**{{ row["name"] }} - {{ row["role"] }}**

</div>