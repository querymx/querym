RIGHT(str,len)

Returns the rightmost `len` characters from the string str, or NULL if any argument is NULL.

```
mysql> SELECT RIGHT('foobarbar', 4);
        -> 'rbar'
```

This function is multibyte safe.
        

