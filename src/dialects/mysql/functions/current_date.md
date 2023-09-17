CURRENT_DATE()

Returns the current date as a value in 'YYYY-MM-DD' or YYYYMMDD format, depending on whether the function is used in string or numeric context.

```
SELECT CURRENT_DATE();
-> '2008-06-13'

SELECT CURRENT_DATE() + 0;
-> 20080613
```
