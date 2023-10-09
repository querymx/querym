LEFT(str,len)

Returns the leftmost len characters from the string str, or NULL if any argument is NULL.

```
mysql> SELECT LEFT('foobarbar', 5);
        -> 'fooba'
```

This function is multibyte safe.
