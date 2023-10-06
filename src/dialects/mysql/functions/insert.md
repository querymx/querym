INSERT(str,pos,len,newstr)

Returns the string str, with the substring beginning at position pos and `len` characters long replaced by the string `newstr`. Returns the original string if pos is not within the length of the string. Replaces the rest of the string from position pos if `len` is not within the length of the rest of the string. Returns `NULL` if any argument is `NULL`.

```
mysql> SELECT INSERT('Quadratic', 3, 4, 'What');
        -> 'QuWhattic'
mysql> SELECT INSERT('Quadratic', -1, 4, 'What');
        -> 'Quadratic'
mysql> SELECT INSERT('Quadratic', 3, 100, 'What');
        -> 'QuWhat'
```

This function is multibyte safe.
