TIME_TO_SEC(time)

Returns the time argument, converted to seconds. Returns NULL if time is NULL.

```
SELECT TIME_TO_SEC('22:23:00');
-> 80580

SELECT TIME_TO_SEC('00:39:38');
-> 2378
```
