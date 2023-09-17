DATEDIFF(expr1,expr2)

DATEDIFF() returns expr1 − expr2 expressed as a value in days from one date to the other. expr1 and expr2 are date or date-and-time expressions. Only the date parts of the values are used in the calculation.

```
SELECT DATEDIFF('2007-12-31 23:59:59','2007-12-30');
-> 1

SELECT DATEDIFF('2010-11-30 23:59:59','2010-12-31');
-> -31
```

This function returns NULL if expr1 or expr2 is NULL.
