JSON_VALUE(json_doc, path)

Extracts a value from a JSON document at the path given in the specified document, and returns the extracted value, optionally converting it to a desired type. The complete syntax is shown here:

```
JSON_VALUE(json_doc, path [RETURNING type] [on_empty] [on_error])

on_empty:
    {NULL | ERROR | DEFAULT value} ON EMPTY

on_error:
    {NULL | ERROR | DEFAULT value} ON ERROR
```

`json_doc` is a valid JSON document. If this is NULL, the function returns NULL.

`path` is a JSON path pointing to a location in the document. This must be a string literal value.

`type` is one of the following data types:
- [FLOAT](https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html)
- [DOUBLE](https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html)
- [DECIMAL](https://dev.mysql.com/doc/refman/8.0/en/fixed-point-types.html)
- SIGNED
- UNSIGNED
- [DATE](https://dev.mysql.com/doc/refman/8.0/en/datetime.html)
- [TIME](https://dev.mysql.com/doc/refman/8.0/en/time.html)
- [DATETIME](https://dev.mysql.com/doc/refman/8.0/en/datetime.html)
- [YEAR](https://dev.mysql.com/doc/refman/8.0/en/year.html) (MySQL 8.0.22 and later)
- YEAR values of one or two digits are not supported.
- [CHAR](https://dev.mysql.com/doc/refman/8.0/en/char.html)
- [JSON](https://dev.mysql.com/doc/refman/8.0/en/json.html)

The types just listed are the same as the (non-array) types supported by the [CAST()](https://dev.mysql.com/doc/refman/8.0/en/cast-functions.html#function_cast) function.

If not specified by a RETURNING clause, the JSON_VALUE() function's return type is [VARCHAR(512)](https://dev.mysql.com/doc/refman/8.0/en/char.html). When no character set is specified for the return type, JSON_VALUE() uses utf8mb4 with the binary collation, which is case-sensitive; if utf8mb4 is specified as the character set for the result, the server uses the default collation for this character set, which is not case-sensitive.

When the data at the specified path consists of or resolves to a JSON null literal, the function returns SQL NULL.

on_empty, if specified, determines how JSON_VALUE() behaves when no data is found at the path given; this clause takes one of the following values:
- NULL ON EMPTY: The function returns NULL; this is the default ON EMPTY behavior.
- DEFAULT value ON EMPTY: the provided value is returned. The value's type must match that of the return type.
- ERROR ON EMPTY: The function throws an error.

If used, on_error takes one of the following values with the corresponding outcome when an error occurs, as listed here:
- NULL ON ERROR: JSON_VALUE() returns NULL; this is the default behavior if no ON ERROR clause is used.
- DEFAULT value ON ERROR: This is the value returned; its value must match that of the return type.
- ERROR ON ERROR: An error is thrown.

ON EMPTY, if used, must precede any ON ERROR clause. Specifying them in the wrong order results in a syntax error.

**Error handling**.  In general, errors are handled by JSON_VALUE() as follows:
- All JSON input (document and path) is checked for validity. If any of it is not valid, an SQL error is thrown without triggering the ON ERROR clause.
- ON ERROR is triggered whenever any of the following events occur:
  - Attempting to extract an object or an array, such as that resulting from a path that resolves to multiple locations within the JSON document
  - Conversion errors, such as attempting to convert 'asdf' to an UNSIGNED value
  - Truncation of values 
- A conversion error always triggers a warning even if NULL ON ERROR or DEFAULT ... ON ERROR is specified.
- The ON EMPTY clause is triggered when the source JSON document (expr) contains no data at the specified location (path).

JSON_VALUE() was introduced in MySQL 8.0.21.

**Examples**.  Two simple examples are shown here:
```
mysql> SELECT JSON_VALUE('{"fname": "Joe", "lname": "Palmer"}', '$.fname');
+--------------------------------------------------------------+
| JSON_VALUE('{"fname": "Joe", "lname": "Palmer"}', '$.fname') |
+--------------------------------------------------------------+
| Joe                                                          |
+--------------------------------------------------------------+

mysql> SELECT JSON_VALUE('{"item": "shoes", "price": "49.95"}', '$.price'
    -> RETURNING DECIMAL(4,2)) AS price;
+-------+
| price |
+-------+
| 49.95 |
+-------+
```

The statement SELECT JSON_VALUE(json_doc, path RETURNING type) is equivalent to the following statement:

```
SELECT CAST(
    JSON_UNQUOTE( JSON_EXTRACT(json_doc, path) )
    AS type
);
```

JSON_VALUE() simplifies creating indexes on JSON columns by making it unnecessary in many cases to create a generated column and then an index on the generated column. You can do this when creating a table t1 that has a JSON column by creating an index on an expression that uses JSON_VALUE() operating on that column (with a path that matches a value in that column), as shown here:

```
CREATE TABLE t1(
    j JSON,
    INDEX i1 ( (JSON_VALUE(j, '$.id' RETURNING UNSIGNED)) )
);
```

The following EXPLAIN output shows that a query against t1 employing the index expression in the WHERE clause uses the index thus created:

```
mysql> EXPLAIN SELECT * FROM t1
    ->     WHERE JSON_VALUE(j, '$.id' RETURNING UNSIGNED) = 123\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: t1
   partitions: NULL
         type: ref
possible_keys: i1
          key: i1
      key_len: 9
          ref: const
         rows: 1
     filtered: 100.00
        Extra: NULL

```

This achieves much the same effect as creating a table t2 with an index on a generated column (see Indexing a Generated Column to Provide a JSON Column Index), like this one:

```
CREATE TABLE t2 (
    j JSON,
    g INT GENERATED ALWAYS AS (j->"$.id"),
    INDEX i1 (g)
);
```

The EXPLAIN output for a query against this table, referencing the generated column, shows that the index is used in the same way as for the previous query against table t1:

```
mysql> EXPLAIN SELECT * FROM t2 WHERE g  = 123\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: t2
   partitions: NULL
         type: ref
possible_keys: i1
          key: i1
      key_len: 5
          ref: const
         rows: 1
     filtered: 100.00
        Extra: NULL
```

