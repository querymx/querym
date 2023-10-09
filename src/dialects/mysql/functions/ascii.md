ASCII(str)

Returns the numeric value of the leftmost character of the string str. Returns 0 if str is the empty string. Returns NULL if str is NULL ASCII() works for 8-bit characters.

```
SELECT ASCII('2');
-> 50
SELECT ASCII(2);
-> 50
SELECT ASCII('dx');
-> 100
```
