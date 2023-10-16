JSON_EXTRACT(json_doc, path[, path] ...)

Returns data from a JSON document, selected from the parts of the document matched by the path arguments. Returns NULL if any argument is NULL or no paths locate a value in the document. An error occurs if the json_doc argument is not a valid JSON document or any path argument is not a valid path expression.

The return value consists of all values matched by the path arguments. If it is possible that those arguments could return multiple values, the matched values are autowrapped as an array, in the order corresponding to the paths that produced them. Otherwise, the return value is the single matched value.

```
mysql> SELECT JSON_EXTRACT('[10, 20, [30, 40]]', '$[1]');
+--------------------------------------------+
| JSON_EXTRACT('[10, 20, [30, 40]]', '$[1]') |
+--------------------------------------------+
| 20                                         |
+--------------------------------------------+
mysql> SELECT JSON_EXTRACT('[10, 20, [30, 40]]', '$[1]', '$[0]');
+----------------------------------------------------+
| JSON_EXTRACT('[10, 20, [30, 40]]', '$[1]', '$[0]') |
+----------------------------------------------------+
| [20, 10]                                           |
+----------------------------------------------------+
mysql> SELECT JSON_EXTRACT('[10, 20, [30, 40]]', '$[2][*]');
+-----------------------------------------------+
| JSON_EXTRACT('[10, 20, [30, 40]]', '$[2][*]') |
+-----------------------------------------------+
| [30, 40]                                      |
+-----------------------------------------------+
```

MySQL supports the -> operator as shorthand for this function as used with 2 arguments where the left hand side is a JSON column identifier (not an expression) and the right hand side is the JSON path to be matched within the column.
