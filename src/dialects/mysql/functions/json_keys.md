JSON_KEYS(json_doc[, path])

Returns the keys from the top-level value of a JSON object as a JSON array, or, if a path argument is given, the top-level keys from the selected path. Returns NULL if any argument is NULL, the json_doc argument is not an object, or path, if given, does not locate an object. An error occurs if the json_doc argument is not a valid JSON document or the path argument is not a valid path expression or contains a * or ** wildcard.

The result array is empty if the selected object is empty. If the top-level value has nested subobjects, the return value does not include keys from those subobjects.

```
mysql> SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}');
+---------------------------------------+
| JSON_KEYS('{"a": 1, "b": {"c": 30}}') |
+---------------------------------------+
| ["a", "b"]                            |
+---------------------------------------+
mysql> SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.b');
+----------------------------------------------+
| JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.b') |
+----------------------------------------------+
| ["c"]                                        |
+----------------------------------------------+
```

