TIME_FORMAT(time,format)

This is used like the DATE_FORMAT() function, but the format string may contain format specifiers only for hours, minutes, seconds, and microseconds. Other specifiers produce a NULL or 0. TIME_FORMAT() returns NULL if time or format is NULL.

If the time value contains an hour part that is greater than 23, the %H and %k hour format specifiers produce a value larger than the usual range of 0..23. The other hour format specifiers produce the hour value modulo 12.

```
SELECT TIME_FORMAT('100:00:00', '%H %k %h %I %l');
 -> '100 100 04 04 4'
```
