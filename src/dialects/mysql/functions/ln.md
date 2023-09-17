LN(X)

Returns the natural logarithm of X; that is, the base-e logarithm of X. If X is less than or equal to 0.0E0, the function returns NULL and a warning “Invalid argument for logarithm” is reported. Returns NULL if X is NULL

```
SELECT LN(2);
-> 0.69314718055995

SELECT LN(-2);
-> NULL
```
