value MEMBER OF(json_array)

Returns true (1) if value is an element of json_array, otherwise returns false (0). value must be a scalar or a JSON document; if it is a scalar, the operator attempts to treat it as an element of a JSON array. If value or json_array is NULL, the function returns NULL.

Queries using MEMBER OF() on JSON columns of [InnoDB](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) tables in the WHERE clause can be optimized using multi-valued indexes. See [Multi-Valued Indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html#create-index-multi-valued), for detailed information and examples.

Simple scalars are treated as array values, as shown here:

```
mysql> SELECT 17 MEMBER OF('[23, "abc", 17, "ab", 10]');
+-------------------------------------------+
| 17 MEMBER OF('[23, "abc", 17, "ab", 10]') |
+-------------------------------------------+
|                                         1 |
+-------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT 'ab' MEMBER OF('[23, "abc", 17, "ab", 10]');
+---------------------------------------------+
| 'ab' MEMBER OF('[23, "abc", 17, "ab", 10]') |
+---------------------------------------------+
|                                           1 |
+---------------------------------------------+
1 row in set (0.00 sec)
```

Partial matches of array element values do not match:

```
mysql> SELECT 7 MEMBER OF('[23, "abc", 17, "ab", 10]');
+------------------------------------------+
| 7 MEMBER OF('[23, "abc", 17, "ab", 10]') |
+------------------------------------------+
|                                        0 |
+------------------------------------------+
1 row in set (0.00 sec)
```

Conversions to and from string types are not performed:

```
mysql> SELECT
    -> 17 MEMBER OF('[23, "abc", "17", "ab", 10]'),
    -> "17" MEMBER OF('[23, "abc", 17, "ab", 10]')\G
*************************** 1. row ***************************
17 MEMBER OF('[23, "abc", "17", "ab", 10]'): 0
"17" MEMBER OF('[23, "abc", 17, "ab", 10]'): 0
1 row in set (0.00 sec)
```

To use this operator with a value which itself an array, it is necessary to cast it explicitly as a JSON array. You can do this with CAST(... AS JSON):

```
mysql> SELECT CAST('[4,5]' AS JSON) MEMBER OF('[[3,4],[4,5]]');
+--------------------------------------------------+
| CAST('[4,5]' AS JSON) MEMBER OF('[[3,4],[4,5]]') |
+--------------------------------------------------+
|                                                1 |
+--------------------------------------------------+
1 row in set (0.00 sec)
```

Any JSON objects used as values to be tested or which appear in the target array must be coerced to the correct type using CAST(... AS JSON) or [JSON_OBJECT()](https://dev.mysql.com/doc/refman/8.0/en/json-creation-functions.html#function_json-object). In addition, a target array containing JSON objects must itself be cast using JSON_ARRAY. This is demonstrated in the following sequence of statements:

```
mysql> SET @a = CAST('{"a":1}' AS JSON);
Query OK, 0 rows affected (0.00 sec)

mysql> SET @b = JSON_OBJECT("b", 2);
Query OK, 0 rows affected (0.00 sec)

mysql> SET @c = JSON_ARRAY(17, @b, "abc", @a, 23);
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @a MEMBER OF(@c), @b MEMBER OF(@c);
+------------------+------------------+
| @a MEMBER OF(@c) | @b MEMBER OF(@c) |
+------------------+------------------+
|                1 |                1 |
+------------------+------------------+
1 row in set (0.00 sec)
```

The MEMBER OF() operator was added in MySQL 8.0.17.
