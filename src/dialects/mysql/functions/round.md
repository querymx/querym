ROUND(X), ROUND(X,D)

Rounds the argument X to D decimal places. The rounding algorithm depends on the data type of X. D defaults to 0 if not specified. D can be negative to cause D digits left of the decimal point of the value X to become zero. The maximum absolute value for D is 30; any digits in excess of 30 (or -30) are truncated. If X or D is NULL, the function returns NULL.

```
SELECT ROUND(-1.23), ROUND(-1.58), ROUND(1.58);
-> -1, -2, 2

SELECT ROUND(1.298, 1), ROUND(1.298, 0), ROUND(23.298, -1);
-> 1.3, 1, 20
```
