JSON_QUOTE(string)

Quotes a string as a JSON value by wrapping it with double quote characters and escaping interior quote and other characters, then returning the result as a utf8mb4 string. Returns NULL if the argument is NULL.

This function is typically used to produce a valid JSON string literal for inclusion within a JSON document.

Certain special characters are escaped with backslashes per the escape sequences shown in [Table 12.23, “JSON_UNQUOTE() Special Character Escape Sequences”](https://dev.mysql.com/doc/refman/8.0/en/json-modification-functions.html#json-unquote-character-escape-sequences).

```
mysql> SELECT JSON_QUOTE('null'), JSON_QUOTE('"null"');
+--------------------+----------------------+
| JSON_QUOTE('null') | JSON_QUOTE('"null"') |
+--------------------+----------------------+
| "null"             | "\"null\""           |
+--------------------+----------------------+
mysql> SELECT JSON_QUOTE('[1, 2, 3]');
+-------------------------+
| JSON_QUOTE('[1, 2, 3]') |
+-------------------------+
| "[1, 2, 3]"             |
+-------------------------+
```
You can also obtain JSON values by casting values of other types to the JSON type using CAST(value AS JSON); [see Converting between JSON and non-JSON values](https://dev.mysql.com/doc/refman/8.0/en/json.html#json-converting-between-types), for more information.

Two aggregate functions generating JSON values are available. JSON_ARRAYAGG() returns a result set as a single JSON array, and JSON_OBJECTAGG() returns a result set as a single JSON object. For more information, see Section 12.19, “Aggregate Functions”.

Two aggregate functions generating JSON values are available. JSON_ARRAYAGG() returns a result set as a single JSON array, and JSON_OBJECTAGG() returns a result set as a single JSON object. For more information, see [Section 12.19, “Aggregate Functions”](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions-and-modifiers.html).
