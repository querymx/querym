LENGTH(str)

Returns the length of the string str, measured in bytes. A multibyte character counts as multiple bytes. This means that for a string containing five 2-byte characters, LENGTH() returns 10, whereas CHAR_LENGTH() returns 1. Returns NULL if str is NULL.

```
mysql> SELECT LENGTH('text');
        -> 4
```

Note : The Length() OpenGIS spatial function is named ST_Length() in MySQL.
