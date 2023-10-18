JSON_STORAGE_SIZE(json_val)

This function returns the number of bytes used to store the binary representation of a JSON document. When the argument is a JSON column, this is the space used to store the JSON document as it was inserted into the column, prior to any partial updates that may have been performed on it afterwards. `json_val` must be a valid JSON document or a string which can be parsed as one. In the case where it is string, the function returns the amount of storage space in the JSON binary representation that is created by parsing the string as JSON and converting it to binary. It returns NULL if the argument is NULL.

An error results when `json_val` is not NULL, and is not—or cannot be successfully parsed as—a JSON document.

To illustrate this function's behavior when used with a JSON column as its argument, we create a table named jtable containing a JSON column jcol, insert a JSON value into the table, then obtain the storage space used by this column with JSON_STORAGE_SIZE(), as shown here:

```
mysql> CREATE TABLE jtable (jcol JSON);
Query OK, 0 rows affected (0.42 sec)

mysql> INSERT INTO jtable VALUES
    ->     ('{"a": 1000, "b": "wxyz", "c": "[1, 3, 5, 7]"}');
Query OK, 1 row affected (0.04 sec)

mysql> SELECT
    ->     jcol,
    ->     JSON_STORAGE_SIZE(jcol) AS Size,
    ->     JSON_STORAGE_FREE(jcol) AS Free
    -> FROM jtable;
+-----------------------------------------------+------+------+
| jcol                                          | Size | Free |
+-----------------------------------------------+------+------+
| {"a": 1000, "b": "wxyz", "c": "[1, 3, 5, 7]"} |   47 |    0 |
+-----------------------------------------------+------+------+
1 row in set (0.00 sec)
```

According to the output of JSON_STORAGE_SIZE(), the JSON document inserted into the column takes up 47 bytes. We also checked the amount of space freed by any previous partial updates of the column using JSON_STORAGE_FREE(); since no updates have yet been performed, this is 0, as expected.

Next we perform an UPDATE on the table that should result in a partial update of the document stored in jcol, and then test the result as shown here:


```
mysql> UPDATE jtable SET jcol = 
    ->     JSON_SET(jcol, "$.b", "a");
Query OK, 1 row affected (0.04 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT
    ->     jcol,
    ->     JSON_STORAGE_SIZE(jcol) AS Size,
    ->     JSON_STORAGE_FREE(jcol) AS Free
    -> FROM jtable;
+--------------------------------------------+------+------+
| jcol                                       | Size | Free |
+--------------------------------------------+------+------+
| {"a": 1000, "b": "a", "c": "[1, 3, 5, 7]"} |   47 |    3 |
+--------------------------------------------+------+------+
1 row in set (0.00 sec)
```

The value returned by JSON_STORAGE_FREE() in the previous query indicates that a partial update of the JSON document was performed, and that this freed 3 bytes of space used to store it. The result returned by JSON_STORAGE_SIZE() is unchanged by the partial update.

Partial updates are supported for updates using JSON_SET(), JSON_REPLACE(), or JSON_REMOVE(). The direct assignment of a value to a JSON column cannot be partially updated; following such an update, JSON_STORAGE_SIZE() always shows the storage used for the newly-set value:

```
mysql> UPDATE jtable
mysql>     SET jcol = '{"a": 4.55, "b": "wxyz", "c": "[true, false]"}';
Query OK, 1 row affected (0.04 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT
    ->     jcol,
    ->     JSON_STORAGE_SIZE(jcol) AS Size,
    ->     JSON_STORAGE_FREE(jcol) AS Free
    -> FROM jtable;
+------------------------------------------------+------+------+
| jcol                                           | Size | Free |
+------------------------------------------------+------+------+
| {"a": 4.55, "b": "wxyz", "c": "[true, false]"} |   56 |    0 |
+------------------------------------------------+------+------+
1 row in set (0.00 sec)
```

A JSON user variable cannot be partially updated. This means that this function always shows the space currently used to store a JSON document in a user variable:

```
mysql> SET @j = '[100, "sakila", [1, 3, 5], 425.05]';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_STORAGE_SIZE(@j) AS Size;
+------------------------------------+------+
| @j                                 | Size |
+------------------------------------+------+
| [100, "sakila", [1, 3, 5], 425.05] |   45 |
+------------------------------------+------+
1 row in set (0.00 sec)

mysql> SET @j = JSON_SET(@j, '$[1]', "json");
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_STORAGE_SIZE(@j) AS Size;
+----------------------------------+------+
| @j                               | Size |
+----------------------------------+------+
| [100, "json", [1, 3, 5], 425.05] |   43 |
+----------------------------------+------+
1 row in set (0.00 sec)

mysql> SET @j = JSON_SET(@j, '$[2][0]', JSON_ARRAY(10, 20, 30));
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_STORAGE_SIZE(@j) AS Size;
+---------------------------------------------+------+
| @j                                          | Size |
+---------------------------------------------+------+
| [100, "json", [[10, 20, 30], 3, 5], 425.05] |   56 |
+---------------------------------------------+------+
1 row in set (0.00 sec)
```

For a JSON literal, this function always returns the current storage space used:

```
mysql> SELECT
    ->     JSON_STORAGE_SIZE('[100, "sakila", [1, 3, 5], 425.05]') AS A,
    ->     JSON_STORAGE_SIZE('{"a": 1000, "b": "a", "c": "[1, 3, 5, 7]"}') AS B,
    ->     JSON_STORAGE_SIZE('{"a": 1000, "b": "wxyz", "c": "[1, 3, 5, 7]"}') AS C,
    ->     JSON_STORAGE_SIZE('[100, "json", [[10, 20, 30], 3, 5], 425.05]') AS D;
+----+----+----+----+
| A  | B  | C  | D  |
+----+----+----+----+
| 45 | 44 | 47 | 56 |
+----+----+----+----+
1 row in set (0.00 sec)
```
