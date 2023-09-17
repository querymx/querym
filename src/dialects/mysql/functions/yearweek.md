YEARWEEK(date), YEARWEEK(date,mode)

Returns year and week for a date. The year in the result may be different from the year in the date argument for the first and the last week of the year. Returns NULL if date is NULL.

The mode argument works exactly like the mode argument to WEEK(). For the single-argument syntax, a mode value of 0 is used. Unlike WEEK(), the value of default_week_format does not influence YEARWEEK().

```
SELECT YEARWEEK('1987-01-01');
-> 198652
```

The week number is different from what the WEEK() function would return (0) for optional arguments 0 or 1, as WEEK() then returns the week in the context of the given year.
