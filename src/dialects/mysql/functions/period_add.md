PERIOD_ADD(P,N)

Adds N months to period P (in the format YYMM or YYYYMM). Returns a value in the format YYYYMM.

This function returns NULL if P or N is NULL.

```
SELECT PERIOD_ADD(200801,2);
-> 200803
```
