REVERSE(str)

Returns the string str with the order of the characters reversed, or NULL if str is NULL.
```
mysql> SELECT REVERSE('abc');
        -> 'cba'
```
This function is multibyte safe.
