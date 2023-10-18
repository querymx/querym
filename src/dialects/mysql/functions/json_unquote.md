JSON_UNQUOTE(json_val)

Unquotes JSON value and returns the result as a `utf8mb4` string. Returns `NULL` if the argument is NULL. An error occurs if the value starts and ends with double quotes but is not a valid JSON string literal.

Within a string, certain sequences have special meaning unless the NO_BACKSLASH_ESCAPES SQL mode is enabled. Each of these sequences begins with a backslash (\), known as the escape character. MySQL recognizes the escape sequences shown in [Table 12.23, “JSON_UNQUOTE() Special Character Escape Sequences”](https://dev.mysql.com/doc/refman/8.0/en/json-modification-functions.html#json-unquote-character-escape-sequences). For all other escape sequences, backslash is ignored. That is, the `escaped character` is interpreted as if it was not escaped. For example, `\x` is just `x`. These sequences are case-sensitive. For example, `\b` is interpreted as a backspace, but `\B` is interpreted as B.

**Table 12.23 JSON_UNQUOTE() Special Character Escape Sequences**

Escape Sequence | Character Represented by Sequence
-- | --
\" | A double quote (") character
\b | A backspace character
\f | A formfeed character
\n | A newline (linefeed) character
\r | A carriage return character
\t | A tab character
\\ | A backslash (\) character
\uXXXX | UTF-8 bytes for Unicode value XXXX

Two simple examples of the use of this function are shown here:

```
mysql> SET @j = '"abc"';
mysql> SELECT @j, JSON_UNQUOTE(@j);
+-------+------------------+
| @j    | JSON_UNQUOTE(@j) |
+-------+------------------+
| "abc" | abc              |
+-------+------------------+
mysql> SET @j = '[1, 2, 3]';
mysql> SELECT @j, JSON_UNQUOTE(@j);
+-----------+------------------+
| @j        | JSON_UNQUOTE(@j) |
+-----------+------------------+
| [1, 2, 3] | [1, 2, 3]        |
+-----------+------------------+
```

The following set of examples shows how JSON_UNQUOTE handles escapes with NO_BACKSLASH_ESCAPES disabled and enabled:

```
mysql> SELECT @@sql_mode;
+------------+
| @@sql_mode |
+------------+
|            |
+------------+

mysql> SELECT JSON_UNQUOTE('"\\t\\u0032"');
+------------------------------+
| JSON_UNQUOTE('"\\t\\u0032"') |
+------------------------------+
|       2                           |
+------------------------------+

mysql> SET @@sql_mode = 'NO_BACKSLASH_ESCAPES';
mysql> SELECT JSON_UNQUOTE('"\\t\\u0032"');
+------------------------------+
| JSON_UNQUOTE('"\\t\\u0032"') |
+------------------------------+
| \t\u0032                     |
+------------------------------+

mysql> SELECT JSON_UNQUOTE('"\t\u0032"');
+----------------------------+
| JSON_UNQUOTE('"\t\u0032"') |
+----------------------------+
|       2                         |
+----------------------------+
```
