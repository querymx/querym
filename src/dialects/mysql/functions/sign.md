SIGN(X)

Returns the sign of the argument as -1, 0, or 1, depending on whether X is negative, zero, or positive. Returns NULL if X is NULL.

```
SELECT SIGN(-32);
-> -1

SELECT SIGN(0);
-> 0

SELECT SIGN(234);
-> 1
```
