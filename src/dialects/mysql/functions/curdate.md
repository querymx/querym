CURDATE()

Returns the current date as a value in 'YYYY-MM-DD' or YYYYMMDD format, depending on whether the function is used in string or numeric context.

```
SELECT CURDATE();
-> '2008-06-13'

SELECT CURDATE() + 0;
-> 20080613
```
