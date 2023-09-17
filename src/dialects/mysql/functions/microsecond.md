MICROSECOND(expr)

Returns the microseconds from the time or datetime expression expr as a number in the range from 0 to 999999. Returns NULL if expr is NULL.

```
SELECT MICROSECOND('12:00:00.123456');
-> 123456

SELECT MICROSECOND('2019-12-31 23:59:59.000010');
-> 10
```
