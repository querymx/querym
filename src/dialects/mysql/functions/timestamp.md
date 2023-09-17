TIMESTAMP(expr), TIMESTAMP(expr1,expr2)

With a single argument, this function returns the date or datetime expression expr as a datetime value. With two arguments, it adds the time expression expr2 to the date or datetime expression expr1 and returns the result as a datetime value. Returns NULL if expr, expr1, or expr2 is NULL.

```
SELECT TIMESTAMP('2003-12-31');
-> '2003-12-31 00:00:00'

SELECT TIMESTAMP('2003-12-31 12:00:00','12:00:00');
-> '2004-01-01 00:00:00'
```
