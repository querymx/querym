LOG(X), LOG(B,X)

If called with one parameter, this function returns the natural logarithm of X. If X is less than or equal to 0.0E0, the function returns NULL and a warning “Invalid argument for logarithm” is reported. Returns NULL if X or B is NULL.

```
SELECT LOG(2);
-> 0.69314718055995

SELECT LOG(-2);
-> NULL
```

If called with two parameters, this function returns the logarithm of X to the base B. If X is less than or equal to 0, or if B is less than or equal to 1, then NULL is returned.

```
SELECT LOG(2, 65536);
-> 16
```
