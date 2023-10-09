LOWER(str)

Returns the string str with all characters changed to lowercase according to the current character set mapping, or NULL if str is NULL. The default character set is utf8mb4.

```
mysql> SELECT LOWER('QUADRATICALLY');
        -> 'quadratically'
```

LOWER() (and UPPER()) are ineffective when applied to binary strings (BINARY, VARBINARY, BLOB). To perform lettercase conversion of a binary string, first convert it to a nonbinary string using a character set appropriate for the data stored in the string:

```
mysql> SET @str = BINARY 'New York';
mysql> SELECT LOWER(@str), LOWER(CONVERT(@str USING utf8mb4));
+-------------+------------------------------------+
| LOWER(@str) | LOWER(CONVERT(@str USING utf8mb4)) |
+-------------+------------------------------------+
| New York    | new york                           |
+-------------+------------------------------------+
```

For collations of Unicode character sets, LOWER() and UPPER() work according to the Unicode Collation Algorithm (UCA) version in the collation name, if there is one, and UCA 4.0.0 if no version is specified. For example, utf8mb4_0900_ai_ci and utf8mb3_unicode_520_ci work according to UCA 9.0.0 and 5.2.0, respectively, whereas utf8mb3_unicode_ci works according to UCA 4.0.0. See Section 10.10.1, “Unicode Character Sets”.

This function is multibyte safe.

LCASE() used within views is rewritten as LOWER().
