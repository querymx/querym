JSON_REMOVE(json_doc, path[, path] ...)

Removes data from a JSON document and returns the result. Returns NULL if any argument is NULL. An error occurs if the json_doc argument is not a valid JSON document or any path argument is not a valid path expression or is $ or contains a * or ** wildcard.

The path arguments are evaluated left to right. The document produced by evaluating one path becomes the new value against which the next path is evaluated.

It is not an error if the element to be removed does not exist in the document; in that case, the path does not affect the document.

```
mysql> SET @j = '["a", ["b", "c"], "d"]';
mysql> SELECT JSON_REMOVE(@j, '$[1]');
+-------------------------+
| JSON_REMOVE(@j, '$[1]') |
+-------------------------+
| ["a", "d"]              |
+-------------------------+
```
