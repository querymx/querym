CURRENT_TIME([fsp])

Returns the current time as a value in 'hh:mm:ss' or hhmmss format, depending on whether the function is used in string or numeric context. The value is expressed in the session time zone.

If the fsp argument is given to specify a fractional seconds precision from 0 to 6, the return value includes a fractional seconds part of that many digits.

```
SELECT CURRENT_TIME();
-> 19:25:37

SELECT CURRENT_TIME(3);
-> 19:25:37.840
```

