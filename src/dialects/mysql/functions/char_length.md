CHAR_LENGTH(str)

Returns the length of the string str, measured in code points. A
multibyte character counts as a single code point. This means
that, for a string containing two 3-byte characters,
LENGTH() returns 6, whereas CHAR_LENGTH() returns 2, as shown here:

```
mysql> SET @dolphin:='海豚';
Query OK, 0 rows affected (0.01 sec)

mysql> SELECT LENGTH(@dolphin), CHAR_LENGTH(@dolphin);
+------------------+-----------------------+
| LENGTH(@dolphin) | CHAR_LENGTH(@dolphin) |
+------------------+-----------------------+
|                6 |                     2 |
+------------------+-----------------------+
1 row in set (0.00 sec)
```

CHAR_LENGTH() returns NULL if str is NULL.

