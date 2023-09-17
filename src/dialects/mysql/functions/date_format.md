DATE_FORMAT(date,format)

Formats the date value according to the format string. If either argument is NULL, the function returns NULL.

```
SELECT DATE_FORMAT('2009-10-04 22:23:00', '%W %M %Y');
-> 'Sunday October 2009'

SELECT DATE_FORMAT('2007-10-04 22:23:00', '%H:%i:%s');
-> '22:23:00'
```

| Specifier | Description |
| --- | --- |
| %a | Abbreviated weekday name (Sun..Sat) |
| %b | Abbreviated month name (Jan..Dec) |
| %c | Month, numeric (0..12) |
| %D | Day of the month with English suffix (0th, 1st, 2nd, 3rd, …) |
| %d | Day of the month, numeric (00..31) |
| %e | Day of the month, numeric (0..31)
| %f | Microseconds (000000..999999)
| %H | Hour (00..23)
| %h | Hour (01..12)
| %I | Hour (01..12)
| %i | Minutes, numeric (00..59)
| %j | Day of year (001..366)
| %k | Hour (0..23)
| %l | Hour (1..12)
| %M | Month name (January..December)
| %m | Month, numeric (00..12)
| %p | AM or PM
| %r | Time, 12-hour (hh:mm:ss followed by AM or PM)
| %S | Seconds (00..59)
| %s | Seconds (00..59)
| %T | Time, 24-hour (hh:mm:ss)
| %U | Week (00..53), where Sunday is the first day of the week; WEEK() mode 0
| %u | Week (00..53), where Monday is the first day of the week; WEEK() mode 1
| %V | Week (01..53), where Sunday is the first day of the week; WEEK() mode 2; used with %X
| %v | Week (01..53), where Monday is the first day of the week; WEEK() mode 3; used with %x
| %W |	Weekday name (Sunday..Saturday)
| %w | Day of the week (0=Sunday..6=Saturday)
| %X | Year for the week where Sunday is the first day of the week, numeric, four digits; used with %V
| %x | Year for the week, where Monday is the first day of the week, numeric, four digits; used with %v
| %Y | Year, numeric, four digits
| %y | Year, numeric (two digits)
| %% | A literal % character
| %x | x, for any “x” not listed above
