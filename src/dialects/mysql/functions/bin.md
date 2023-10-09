BIN(N)

Returns a string representation of the binary value of `N`, where `N` is a longlong (BIGINT) number. This is equivalent to CONV(N,10,2) Returns `NULL` if `N` is `NULL`.

```
SELECT BIN(12);
-> '1100'
```
