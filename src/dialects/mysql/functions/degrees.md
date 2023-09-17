DEGREES(X)

Returns the argument X, converted from radians to degrees. Returns NULL if X is NULL.

```
SELECT DEGREES(PI());
-> 180

SELECT DEGREES(PI() / 2);
-> 90
```
