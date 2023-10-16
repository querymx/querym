JSON_ARRAY_INSERT(json_doc, path, val[, path, val] ...)

Updates a JSON document, inserting into an array within the document and returning the modified document. Returns NULL if any argument is NULL. An error occurs if the json_doc argument is not a valid JSON document or any path argument is not a valid path expression or contains a * or ** wildcard or does not end with an array element identifier.

The path-value pairs are evaluated left to right. The document produced by evaluating one pair becomes the new value against which the next pair is evaluated.

Pairs for which the path does not identify any array in the JSON document are ignored. If a path identifies an array element, the corresponding value is inserted at that element position, shifting any following values to the right. If a path identifies an array position past the end of an array, the value is inserted at the end of the array.

```
mysql> SET @j = '["a", {"b": [1, 2]}, [3, 4]]';
mysql> SELECT JSON_ARRAY_INSERT(@j, '$[1]', 'x');
+------------------------------------+
| JSON_ARRAY_INSERT(@j, '$[1]', 'x') |
+------------------------------------+
| ["a", "x", {"b": [1, 2]}, [3, 4]]  |
+------------------------------------+
mysql> SELECT JSON_ARRAY_INSERT(@j, '$[100]', 'x');
+--------------------------------------+
| JSON_ARRAY_INSERT(@j, '$[100]', 'x') |
+--------------------------------------+
| ["a", {"b": [1, 2]}, [3, 4], "x"]    |
+--------------------------------------+
mysql> SELECT JSON_ARRAY_INSERT(@j, '$[1].b[0]', 'x');
+-----------------------------------------+
| JSON_ARRAY_INSERT(@j, '$[1].b[0]', 'x') |
+-----------------------------------------+
| ["a", {"b": ["x", 1, 2]}, [3, 4]]       |
+-----------------------------------------+
mysql> SELECT JSON_ARRAY_INSERT(@j, '$[2][1]', 'y');
+---------------------------------------+
| JSON_ARRAY_INSERT(@j, '$[2][1]', 'y') |
+---------------------------------------+
| ["a", {"b": [1, 2]}, [3, "y", 4]]     |
+---------------------------------------+
mysql> SELECT JSON_ARRAY_INSERT(@j, '$[0]', 'x', '$[2][1]', 'y');
+----------------------------------------------------+
| JSON_ARRAY_INSERT(@j, '$[0]', 'x', '$[2][1]', 'y') |
+----------------------------------------------------+
| ["x", "a", {"b": [1, 2]}, [3, 4]]                  |
+----------------------------------------------------+
```

Earlier modifications affect the positions of the following elements in the array, so subsequent paths in the same `JSON_ARRAY_INSERT()` call should take this into account. In the final example, the second path inserts nothing because the path no longer matches anything after the first insert.
