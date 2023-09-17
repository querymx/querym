TO_SECONDS(expr)

Given a date or datetime expr, returns the number of seconds since the year 0. If expr is not a valid date or datetime value (including NULL), it returns NULL.

```
SELECT TO_SECONDS(950501);
-> 62966505600

SELECT TO_SECONDS('2009-11-29');
-> 63426672000

SELECT TO_SECONDS('2009-11-29 13:43:32');
-> 63426721412

SELECT TO_SECONDS( NOW() );
-> 63426721458
```
