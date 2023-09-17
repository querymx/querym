WEEKOFYEAR(date)

Returns the calendar week of the date as a number in the range from 1 to 53. Returns NULL if date is NULL.

WEEKOFYEAR() is a compatibility function that is equivalent to WEEK(date,3).

```
SELECT WEEKOFYEAR('2008-02-20');
-> 8
```
