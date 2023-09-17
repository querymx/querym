WEEKDAY(date)

Returns the weekday index for date (0 = Monday, 1 = Tuesday, … 6 = Sunday). Returns NULL if date is NULL.

```
SELECT WEEKDAY('2008-02-03 22:23:00');
-> 6

SELECT WEEKDAY('2007-11-06');
-> 1
```
