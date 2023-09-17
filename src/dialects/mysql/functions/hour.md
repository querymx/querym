HOUR(time)

Returns the hour for time. The range of the return value is 0 to 23 for time-of-day values. However, the range of TIME values actually is much larger, so HOUR can return values greater than 23. Returns NULL if time is NULL.

```
SELECT HOUR('10:05:03');
-> 10

SELECT HOUR('272:59:59');
-> 272
```
