DAY(date)

Returns the day of the month for date, in the range 1 to 31, or 0 for dates such as '0000-00-00' or '2008-00-00' that have a zero day part. Returns NULL if date is NULL.

```
SELECT DAY('2007-02-03');
-> 3
```
