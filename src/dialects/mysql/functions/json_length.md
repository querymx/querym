JSON_LENGTH(json_doc[, path])

Returns the length of a JSON document, or, if a path argument is given, the length of the value within the document identified by the path. Returns NULL if any argument is NULL or the path argument does not identify a value in the document. An error occurs if the json_doc argument is not a valid JSON document or the path argument is not a valid path expression. Prior to MySQL 8.0.26, an error is also raised if the path expression contains a * or ** wildcard.

The length of a document is determined as follows:
- The length of a scalar is 1.
- The length of an array is the number of array elements.
- The length of an object is the number of object members.
- The length does not count the length of nested arrays or objects.

```
mysql> SELECT JSON_LENGTH('[1, 2, {"a": 3}]');
+---------------------------------+
| JSON_LENGTH('[1, 2, {"a": 3}]') |
+---------------------------------+
|                               3 |
+---------------------------------+
mysql> SELECT JSON_LENGTH('{"a": 1, "b": {"c": 30}}');
+-----------------------------------------+
| JSON_LENGTH('{"a": 1, "b": {"c": 30}}') |
+-----------------------------------------+
|                                       2 |
+-----------------------------------------+
mysql> SELECT JSON_LENGTH('{"a": 1, "b": {"c": 30}}', '$.b');
+------------------------------------------------+
| JSON_LENGTH('{"a": 1, "b": {"c": 30}}', '$.b') |
+------------------------------------------------+
|                                              1 |
+------------------------------------------------+
```

