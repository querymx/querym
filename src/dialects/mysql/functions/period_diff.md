PERIOD_DIFF(P1,P2)

Returns the number of months between periods P1 and P2. P1 and P2 should be in the format YYMM or YYYYMM. Note that the period arguments P1 and P2 are not date values.

This function returns NULL if P1 or P2 is NULL.

```
SELECT PERIOD_DIFF(200802,200703);
-> 11
```
