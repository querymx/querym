JSON_SET(json_doc, path, val[, path, val] ...)

Inserts or updates data in a JSON document and returns the result. Returns NULL if json_doc or path is NULL, or if path, when given, does not locate an object. Otherwise, an error occurs if the json_doc argument is not a valid JSON document or any path argument is not a valid path expression or contains a * or ** wildcard.

The path-value pairs are evaluated left to right. The document produced by evaluating one pair becomes the new value against which the next pair is evaluated.

A path-value pair for an existing path in the document overwrites the existing document value with the new value. A path-value pair for a nonexisting path in the document adds the value to the document if the path identifies one of these types of values:
- A member not present in an existing object. The member is added to the object and associated with the new value.
- A position past the end of an existing array. The array is extended with the new value. If the existing value is not an array, it is autowrapped as an array, then extended with the new value.

Otherwise, a path-value pair for a nonexisting path in the document is ignored and has no effect.

In MySQL 8.0.4, the optimizer can perform a partial, in-place update of a JSON column instead of removing the old document and writing the new document in its entirety to the column. This optimization can be performed for an update statement that uses the JSON_SET() function and meets the conditions outlined in [Partial Updates of JSON Values](https://dev.mysql.com/doc/refman/8.0/en/json.html#json-partial-updates).

The JSON_SET(), JSON_INSERT(), and JSON_REPLACE() functions are related:
- JSON_SET() replaces existing values and adds nonexisting values.
- JSON_INSERT() inserts values without replacing existing values.
- JSON_REPLACE() replaces only existing values.
  
The following examples illustrate these differences, using one path that does exist in the document ($.a) and another that does not exist ($.c):

```
mysql> SET @j = '{ "a": 1, "b": [2, 3]}';
mysql> SELECT JSON_SET(@j, '$.a', 10, '$.c', '[true, false]');
+-------------------------------------------------+
| JSON_SET(@j, '$.a', 10, '$.c', '[true, false]') |
+-------------------------------------------------+
| {"a": 10, "b": [2, 3], "c": "[true, false]"}    |
+-------------------------------------------------+
mysql> SELECT JSON_INSERT(@j, '$.a', 10, '$.c', '[true, false]');
+----------------------------------------------------+
| JSON_INSERT(@j, '$.a', 10, '$.c', '[true, false]') |
+----------------------------------------------------+
| {"a": 1, "b": [2, 3], "c": "[true, false]"}        |
+----------------------------------------------------+
mysql> SELECT JSON_REPLACE(@j, '$.a', 10, '$.c', '[true, false]');
+-----------------------------------------------------+
| JSON_REPLACE(@j, '$.a', 10, '$.c', '[true, false]') |
+-----------------------------------------------------+
| {"a": 10, "b": [2, 3]}                              |
+-----------------------------------------------------+
```

