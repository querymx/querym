UTC_TIME([fsp])

Returns the current UTC time as a value in 'hh:mm:ss' or hhmmss format, depending on whether the function is used in string or numeric context.

If the fsp argument is given to specify a fractional seconds precision from 0 to 6, the return value includes a fractional seconds part of that many digits.

```
SELECT UTC_TIME(), UTC_TIME() + 0;
-> '18:07:53', 180753.000000
```
