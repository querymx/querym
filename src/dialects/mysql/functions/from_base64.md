FROM_BASE64(str)

Takes a string encoded with the base-64 encoded rules used by TO_BASE64() and returns the decoded result as a binary string. The result is NULL if the argument is NULL or not a valid base-64 string. See the description of TO_BASE64() for details about the encoding and decoding rules.

```
mysql> SELECT TO_BASE64('abc'), FROM_BASE64(TO_BASE64('abc'));
        -> 'JWJj', 'abc'
```

If FROM_BASE64() is invoked from within the mysql client, binary strings display using hexadecimal notation. You can disable this behavior by setting the value of the --binary-as-hex to 0 when starting the mysql client. For more information about that option, see Section 4.5.1, “mysql — The MySQL Command-Line Client”.
