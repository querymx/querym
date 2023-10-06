RTRIM(str)

Returns the string str with trailing space characters removed.
```
mysql> SELECT RTRIM('barbar   ');
        -> 'barbar'
```

This function is multibyte safe, and returns NULL if str is NULL.
