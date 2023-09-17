UTC_DATE()

Returns the current UTC date as a value in 'YYYY-MM-DD' or YYYYMMDD format, depending on whether the function is used in string or numeric context.

```
SELECT UTC_DATE(), UTC_DATE() + 0;
-> '2003-08-14', 20030814
```
