MONTH(date)

Returns the month for date, in the range 1 to 12 for January to December, or 0 for dates such as '0000-00-00' or '2008-00-00' that have a zero month part. Returns NULL if date is NULL.

```
SELECT MONTH('2008-02-03');
-> 2
```
