TRUNCATE(X,D)

Returns the number X, truncated to D decimal places. If D is 0, the result has no decimal point or fractional part. D can be negative to cause D digits left of the decimal point of the value X to become zero. If X or D is NULL, the function returns NULL.

```
SELECT TRUNCATE(1.223,1);
-> 1.2

SELECT TRUNCATE(1.999,1);
-> 1.9

SELECT TRUNCATE(1.999,0);
-> 1

SELECT TRUNCATE(-1.999,1);
-> -1.9

SELECT TRUNCATE(122,-2);
-> 100

SELECT TRUNCATE(10.28*100,0);
-> 1028
```
