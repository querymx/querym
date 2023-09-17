MOD(N,M)

Modulo operation. Returns the remainder of N divided by M. Returns NULL if M or N is NULL.

```
SELECT MOD(234, 10);
-> 4
```

This function is safe to use with BIGINT values.

MOD() also works on values that have a fractional part and returns the exact remainder after division:

```
SELECT MOD(34.5,3);
-> 1.5
```
