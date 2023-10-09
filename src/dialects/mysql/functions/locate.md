LOCATE(substr,str), LOCATE(substr,str,pos)

The first syntax returns the position of the first occurrence of substring `substr` in string str. The second syntax returns the position of the first occurrence of substring `substr` in string str, starting at position pos. Returns 0 if `substr` is not in str. Returns NULL if any argument is `NULL`.

```
mysql> SELECT LOCATE('bar', 'foobarbar');
        -> 4
mysql> SELECT LOCATE('xbar', 'foobar');
        -> 0
mysql> SELECT LOCATE('bar', 'foobarbar', 5);
        -> 7
```

This function is multibyte safe, and is case-sensitive only if at least one argument is a binary string
