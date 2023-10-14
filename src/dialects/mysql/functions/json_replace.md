JSON_REPLACE(json_doc, path, val[, path, val] ...)

Replaces existing values in a JSON document and returns the result. Returns NULL if any argument is NULL. An error occurs if the json_doc argument is not a valid JSON document or any path argument is not a valid path expression or contains a * or ** wildcard.

The path-value pairs are evaluated left to right. The document produced by evaluating one pair becomes the new value against which the next pair is evaluated.

A path-value pair for an existing path in the document overwrites the existing document value with the new value. A path-value pair for a nonexisting path in the document is ignored and has no effect.

In MySQL 8.0.4, the optimizer can perform a partial, in-place update of a JSON column instead of removing the old document and writing the new document in its entirety to the column. This optimization can be performed for an update statement that uses the JSON_REPLACE() function and meets the conditions outlined in [Partial Updates of JSON Values](https://dev.mysql.com/doc/refman/8.0/en/json.html#json-partial-updates).

For a comparison of JSON_INSERT(), JSON_REPLACE(), and JSON_SET(), see the discussion of JSON_SET().

```
mysql> SET @j = '{ "a": 1, "b": [2, 3]}';
mysql> SELECT JSON_REPLACE(@j, '$.a', 10, '$.c', '[true, false]');
+-----------------------------------------------------+
| JSON_REPLACE(@j, '$.a', 10, '$.c', '[true, false]') |
+-----------------------------------------------------+
| {"a": 10, "b": [2, 3]}                              |
+-----------------------------------------------------+
```
