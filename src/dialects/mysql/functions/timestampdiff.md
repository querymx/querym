TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)

Returns datetime_expr2 − datetime_expr1, where datetime_expr1 and datetime_expr2 are date or datetime expressions. One expression may be a date and the other a datetime; a date value is treated as a datetime having the time part '00:00:00' where necessary. The unit for the result (an integer) is given by the unit argument. The legal values for unit are the same as those listed in the description of the TIMESTAMPADD() function.

```
SELECT TIMESTAMPDIFF(MONTH,'2003-02-01','2003-05-01');
-> 3

SELECT TIMESTAMPDIFF(YEAR,'2002-05-01','2001-01-01');
-> -1

SELECT TIMESTAMPDIFF(MINUTE,'2003-02-01','2003-05-01 12:05:55');
-> 128885
```
