WEEK(date[,mode])

This function returns the week number for date. The two-argument form of WEEK() enables you to specify whether the week starts on Sunday or Monday and whether the return value should be in the range from 0 to 53 or from 1 to 53.

```
SELECT WEEK('2008-02-20');
-> 7

SELECT WEEK('2008-02-20',0);
-> 7

SELECT WEEK('2008-02-20',1);
-> 8

SELECT WEEK('2008-12-31',1);
-> 53
```
