RAND([N])

Returns a random floating-point value v in the range `0 <= v < 1.0`. To obtain a random integer R in the range i <= R < j, use the expression `FLOOR(i + RAND() * (j − i))`. For example, to obtain a random integer in the range the range `7 <= R < 12`, use the following statement:

```
SELECT FLOOR(7 + (RAND() * 5));
```

If an integer argument `N` is specified, it is used as the seed value:
