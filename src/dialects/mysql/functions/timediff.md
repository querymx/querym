TIMEDIFF(expr1,expr2)

TIMEDIFF() returns expr1 − expr2 expressed as a time value. expr1 and expr2 are strings which are converted to TIME or DATETIME expressions; these must be of the same type following conversion. Returns NULL if expr1 or expr2 is NULL.

The result returned by TIMEDIFF() is limited to the range allowed for TIME values. Alternatively, you can use either of the functions TIMESTAMPDIFF() and UNIX_TIMESTAMP(), both of which return integers.

```
SELECT TIMEDIFF('2000-01-01 00:00:00', '2000-01-01 00:00:00.000001');
-> '-00:00:00.000001'

SELECT TIMEDIFF('2008-12-31 23:59:59.000001', '2008-12-30 01:01:01.000002');
-> '46:58:57.999999'
```
