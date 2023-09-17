SUBDATE(date,INTERVAL expr unit), SUBDATE(expr,days)

When invoked with the INTERVAL form of the second argument, SUBDATE() is a synonym for DATE_SUB(). For information on the INTERVAL unit argument, see the discussion for DATE_ADD().

```
SELECT DATE_SUB('2008-01-02', INTERVAL 31 DAY);
-> '2007-12-02'

SELECT SUBDATE('2008-01-02', INTERVAL 31 DAY);
-> '2007-12-02'
```

The second form enables the use of an integer value for days. In such cases, it is interpreted as the number of days to be subtracted from the date or datetime expression expr.

```
SELECT SUBDATE('2008-01-02 12:00:00', 31);
 -> '2007-12-02 12:00:00'
```

This function returns NULL if any of its arguments are NULL.
