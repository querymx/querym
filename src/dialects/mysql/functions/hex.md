HEX(str), HEX(N)

For a string argument str, HEX() returns a hexadecimal string representation of str where each byte of each character in str is converted to two hexadecimal digits.

For a numeric argument N, HEX() returns a hexadecimal string representation of the value of N treated as a longlong (BIGINT) number.

```
SELECT X'616263', HEX('abc'), UNHEX(HEX('abc'));
-> 'abc', 616263, 'abc'

SELECT HEX(255), CONV(HEX(255),16,10);
-> 'FF', 255
```
