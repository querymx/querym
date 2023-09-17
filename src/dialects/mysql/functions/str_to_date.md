STR_TO_DATE(str,format)

This is the inverse of the DATE_FORMAT() function. It takes a string str and a format string format. STR_TO_DATE() returns a DATETIME value if the format string contains both date and time parts, or a DATE or TIME value if the string contains only date or time parts. If str or format is NULL, the function returns NULL. If the date, time, or datetime value extracted from str cannot be parsed according to the rules followed by the server, STR_TO_DATE() returns NULL and produces a warning.

The server scans str attempting to match format to it. The format string can contain literal characters and format specifiers beginning with %. Literal characters in format must match literally in str. Format specifiers in format must match a date or time part in str. For the specifiers that can be used in format, see the DATE_FORMAT() function description.

```
SELECT STR_TO_DATE('01,5,2013','%d,%m,%Y');
-> '2013-05-01'

SELECT STR_TO_DATE('May 1, 2013','%M %d,%Y');
-> '2013-05-01'
```
