TIMESTAMPADD(unit,interval,datetime_expr)

Adds the integer expression interval to the date or datetime expression datetime_expr. The unit for interval is given by the unit argument, which should be one of the following values: MICROSECOND (microseconds), SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, or YEAR.

The unit value may be specified using one of keywords as shown, or with a prefix of SQL_TSI_. For example, DAY and SQL_TSI_DAY both are legal.

This function returns NULL if interval or datetime_expr is NULL.

```
SELECT TIMESTAMPADD(MINUTE, 1, '2003-01-02');
-> '2003-01-02 00:01:00'

SELECT TIMESTAMPADD(WEEK,1,'2003-01-02');
-> '2003-01-09'
```
