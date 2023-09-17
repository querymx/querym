FORMAT(X,D[,locale])

Formats the number X to a format like '#,###,###.##', rounded to D decimal places, and returns the result as a string.

If D is 0, the result has no decimal point or fractional part. If X or D is NULL, the function returns NULL.

```
SELECT FORMAT(12332.123456, 4);
-> '12,332.1235'

SELECT FORMAT(12332.1,4);
-> '12,332.1000'

SELECT FORMAT(12332.2,0);
-> '12,332'

SELECT FORMAT(12332.2,2,'de_DE');
-> '12.332,20'
```
