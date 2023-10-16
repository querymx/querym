JSON_MERGE_PRESERVE(json_doc, json_doc[, json_doc] ...)

Merges two or more JSON documents and returns the merged result. Returns NULL if any argument is NULL. An error occurs if any argument is not a valid JSON document.

Merging takes place according to the following rules. For additional information, see [Normalization, Merging, and Autowrapping of JSON Values](https://dev.mysql.com/doc/refman/8.0/en/json.html#json-normalization).
- Adjacent arrays are merged to a single array.
- Adjacent objects are merged to a single object.
- A scalar value is autowrapped as an array and merged as an array.
- A scalar value is autowrapped as an array and merged as an array.

```
mysql> SELECT JSON_MERGE_PRESERVE('[1, 2]', '[true, false]');
+------------------------------------------------+
| JSON_MERGE_PRESERVE('[1, 2]', '[true, false]') |
+------------------------------------------------+
| [1, 2, true, false]                            |
+------------------------------------------------+

mysql> SELECT JSON_MERGE_PRESERVE('{"name": "x"}', '{"id": 47}');
+----------------------------------------------------+
| JSON_MERGE_PRESERVE('{"name": "x"}', '{"id": 47}') |
+----------------------------------------------------+
| {"id": 47, "name": "x"}                            |
+----------------------------------------------------+

mysql> SELECT JSON_MERGE_PRESERVE('1', 'true');
+----------------------------------+
| JSON_MERGE_PRESERVE('1', 'true') |
+----------------------------------+
| [1, true]                        |
+----------------------------------+

mysql> SELECT JSON_MERGE_PRESERVE('[1, 2]', '{"id": 47}');
+---------------------------------------------+
| JSON_MERGE_PRESERVE('[1, 2]', '{"id": 47}') |
+---------------------------------------------+
| [1, 2, {"id": 47}]                          |
+---------------------------------------------+

mysql> SELECT JSON_MERGE_PRESERVE('{ "a": 1, "b": 2 }',
     >    '{ "a": 3, "c": 4 }');
+--------------------------------------------------------------+
| JSON_MERGE_PRESERVE('{ "a": 1, "b": 2 }','{ "a": 3, "c":4 }') |
+--------------------------------------------------------------+
| {"a": [1, 3], "b": 2, "c": 4}                                |
+--------------------------------------------------------------+

mysql> SELECT JSON_MERGE_PRESERVE('{ "a": 1, "b": 2 }','{ "a": 3, "c": 4 }',
     >    '{ "a": 5, "d": 6 }');
+----------------------------------------------------------------------------------+
| JSON_MERGE_PRESERVE('{ "a": 1, "b": 2 }','{ "a": 3, "c": 4 }','{ "a": 5, "d": 6 }') |
+----------------------------------------------------------------------------------+
| {"a": [1, 3, 5], "b": 2, "c": 4, "d": 6}                                         |
+----------------------------------------------------------------------------------+
```

This function was added in MySQL 8.0.3 as a synonym for JSON_MERGE(). The JSON_MERGE() function is now deprecated, and is subject to removal in a future release of MySQL.

This function is similar to but differs from JSON_MERGE_PATCH() in significant respects; see [JSON_MERGE_PATCH() compared with JSON_MERGE_PRESERVE()](https://dev.mysql.com/doc/refman/8.0/en/json-modification-functions.html#json-merge-patch-json-merge-preserve-compared), for more information.


