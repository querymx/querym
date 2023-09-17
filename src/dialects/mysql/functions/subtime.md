SUBTIME(expr1,expr2)

SUBTIME() returns expr1 − expr2 expressed as a value in the same format as expr1. expr1 is a time or datetime expression, and expr2 is a time expression.

Resolution of this function's return type is performed as it is for the ADDTIME() function; see the description of that function for more information.

```
SELECT SUBTIME('2007-12-31 23:59:59.999999','1 1:1:1.000002');
-> '2007-12-30 22:58:58.999997'

SELECT SUBTIME('01:00:00.999999', '02:00:00.999998');
-> '-00:59:59.999999'
```

This function returns NULL if expr1 or expr2 is NULL.
