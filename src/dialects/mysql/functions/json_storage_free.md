JSON_STORAGE_FREE(json_val)

For a JSON column value, this function shows how much storage space was freed in its binary representation after it was updated in place using JSON_SET(), JSON_REPLACE(), or JSON_REMOVE(). The argument can also be a valid JSON document or a string which can be parsed as one—either as a literal value or as the value of a user variable—in which case the function returns 0. It returns a positive, nonzero value if the argument is a JSON column value which has been updated as described previously, such that its binary representation takes up less space than it did prior to the update. For a JSON column which has been updated such that its binary representation is the same as or larger than before, or if the update was not able to take advantage of a partial update, it returns 0; it returns NULL if the argument is NULL.

If json_val is not NULL, and neither is a valid JSON document nor can be successfully parsed as one, an error results.

In this example, we create a table containing a JSON column, then insert a row containing a JSON object:

```
mysql> CREATE TABLE jtable (jcol JSON);
Query OK, 0 rows affected (0.38 sec)

mysql> INSERT INTO jtable VALUES
    ->     ('{"a": 10, "b": "wxyz", "c": "[true, false]"}');
Query OK, 1 row affected (0.04 sec)

mysql> SELECT * FROM jtable;
+----------------------------------------------+
| jcol                                         |
+----------------------------------------------+
| {"a": 10, "b": "wxyz", "c": "[true, false]"} |
+----------------------------------------------+
1 row in set (0.00 sec)
```

Now we update the column value using JSON_SET() such that a partial update can be performed; in this case, we replace the value pointed to by the c key (the array [true, false]) with one that takes up less space (the integer 1):

```
mysql> UPDATE jtable
    ->     SET jcol = JSON_SET(jcol, "$.a", 10, "$.b", "wxyz", "$.c", 1);
Query OK, 1 row affected (0.03 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM jtable;
+--------------------------------+
| jcol                           |
+--------------------------------+
| {"a": 10, "b": "wxyz", "c": 1} |
+--------------------------------+
1 row in set (0.00 sec)

mysql> SELECT JSON_STORAGE_FREE(jcol) FROM jtable;
+-------------------------+
| JSON_STORAGE_FREE(jcol) |
+-------------------------+
|                      14 |
+-------------------------+
1 row in set (0.00 sec)
```

The effects of successive partial updates on this free space are cumulative, as shown in this example using JSON_SET() to reduce the space taken up by the value having key b (and making no other changes):

```
mysql> UPDATE jtable
    ->     SET jcol = JSON_SET(jcol, "$.a", 10, "$.b", "wx", "$.c", 1);
Query OK, 1 row affected (0.03 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT JSON_STORAGE_FREE(jcol) FROM jtable;
+-------------------------+
| JSON_STORAGE_FREE(jcol) |
+-------------------------+
|                      16 |
+-------------------------+
1 row in set (0.00 sec)
```

Updating the column without using JSON_SET(), JSON_REPLACE(), or JSON_REMOVE() means that the optimizer cannot perform the update in place; in this case, JSON_STORAGE_FREE() returns 0, as shown here:


```
mysql> UPDATE jtable SET jcol = '{"a": 10, "b": 1}';
Query OK, 1 row affected (0.05 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT JSON_STORAGE_FREE(jcol) FROM jtable;
+-------------------------+
| JSON_STORAGE_FREE(jcol) |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.00 sec)
```

Partial updates of JSON documents can be performed only on column values. For a user variable that stores a JSON value, the value is always completely replaced, even when the update is performed using JSON_SET():

```
mysql> SET @j = '{"a": 10, "b": "wxyz", "c": "[true, false]"}';
Query OK, 0 rows affected (0.00 sec)

mysql> SET @j = JSON_SET(@j, '$.a', 10, '$.b', 'wxyz', '$.c', '1');
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_STORAGE_FREE(@j) AS Free;
+----------------------------------+------+
| @j                               | Free |
+----------------------------------+------+
| {"a": 10, "b": "wxyz", "c": "1"} |    0 |
+----------------------------------+------+
1 row in set (0.00 sec)
```

For a JSON literal, this function always returns 0:

```
mysql> SELECT JSON_STORAGE_FREE('{"a": 10, "b": "wxyz", "c": "1"}') AS Free;
+------+
| Free |
+------+
|    0 |
+------+
1 row in set (0.00 sec)
```
