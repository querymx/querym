ADDDATE(date,INTERVAL expr unit), ADDDATE(date,days)

When invoked with the INTERVAL form of the second argument, ADDDATE() is a synonym for DATE_ADD(). The related function SUBDATE() is a synonym for DATE_SUB(). For information on the INTERVAL unit argument, see Temporal Intervals.

```
SELECT ADDDATE('2008-01-02', INTERVAL 31 DAY);
-> '2008-02-02'
```
