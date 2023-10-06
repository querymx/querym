LTRIM(str)

Returns the string str with leading space characters removed. Returns NULL if str is NULL. his function is multibyte safe.

```
mysql> SELECT LTRIM('  barbar');
        -> 'barbar'
```
