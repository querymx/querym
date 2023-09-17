MONTHNAME(date)

Returns the full name of the month for date. The language used for the name is controlled by the value of the lc_time_names system variable (Section 10.16, “MySQL Server Locale Support”). Returns NULL if date is NULL.

```
SELECT MONTHNAME('2008-02-03');
-> 'February'
```
