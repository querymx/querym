DATE(expr)

Extracts the date part of the date or datetime expression expr. Returns NULL if expr is NULL.

```
SELECT DATE('2003-12-31 01:02:03');
-> '2003-12-31'
```
