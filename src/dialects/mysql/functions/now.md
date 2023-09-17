NOW([fsp])

Returns the current date and time as a value in 'YYYY-MM-DD hh:mm:ss' or YYYYMMDDhhmmss format, depending on whether the function is used in string or numeric context. The value is expressed in the session time zone.

If the fsp argument is given to specify a fractional seconds precision from 0 to 6, the return value includes a fractional seconds part of that many digits.

```
SELECT NOW();
-> '2007-12-15 23:50:26'

SELECT NOW() + 0;
-> 20071215235026.000000
```
