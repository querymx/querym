DAYOFWEEK(date)

Returns the weekday index for date (1 = Sunday, 2 = Monday, …, 7 = Saturday). These index values correspond to the ODBC standard. Returns NULL if date is NULL.

```
SELECT DAYOFWEEK('2007-02-03');
-> 7
```
