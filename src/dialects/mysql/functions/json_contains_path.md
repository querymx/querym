JSON_CONTAINS_PATH(json_doc, one_or_all, path[, path] ...)

Returns 0 or 1 to indicate whether a JSON document contains data at a given path or paths. Returns NULL if any argument is NULL. An error occurs if the json_doc argument is not a valid JSON document, any path argument is not a valid path expression, or one_or_all is not 'one' or 'all'.

To check for a specific value at a path, use JSON_CONTAINS() instead.

The return value is 0 if no specified path exists within the document. Otherwise, the return value depends on the one_or_all argument:
- `'one'`: 1 if at least one path exists within the document, 0 otherwise.
- `'all'`: 1 if all paths exist within the document, 0 otherwise.

```
mysql> SET @j = '{"a": 1, "b": 2, "c": {"d": 4}}';
mysql> SELECT JSON_CONTAINS_PATH(@j, 'one', '$.a', '$.e');
+---------------------------------------------+
| JSON_CONTAINS_PATH(@j, 'one', '$.a', '$.e') |
+---------------------------------------------+
|                                           1 |
+---------------------------------------------+
mysql> SELECT JSON_CONTAINS_PATH(@j, 'all', '$.a', '$.e');
+---------------------------------------------+
| JSON_CONTAINS_PATH(@j, 'all', '$.a', '$.e') |
+---------------------------------------------+
|                                           0 |
+---------------------------------------------+
mysql> SELECT JSON_CONTAINS_PATH(@j, 'one', '$.c.d');
+----------------------------------------+
| JSON_CONTAINS_PATH(@j, 'one', '$.c.d') |
+----------------------------------------+
|                                      1 |
+----------------------------------------+
mysql> SELECT JSON_CONTAINS_PATH(@j, 'one', '$.a.d');
+----------------------------------------+
| JSON_CONTAINS_PATH(@j, 'one', '$.a.d') |
+----------------------------------------+
|                                      0 |
+----------------------------------------+
```
