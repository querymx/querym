LPAD(str,len,padstr)

Returns the string str, left-padded with the string `padstr` to a length of `len` characters. If str is longer than `len`, the return value is shortened to `len` characters.

```
mysql> SELECT LPAD('hi',4,'??');
        -> '??hi'
mysql> SELECT LPAD('hi',1,'??');
        -> 'h'
```

Returns NULL if any of its arguments are NULL.
