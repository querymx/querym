TIME(expr)

Extracts the time part of the time or datetime expression expr and returns it as a string. Returns NULL if expr is NULL.

```
SELECT TIME('2003-12-31 01:02:03');
-> '01:02:03'

SELECT TIME('2003-12-31 01:02:03.000123');
-> '01:02:03.000123
```
