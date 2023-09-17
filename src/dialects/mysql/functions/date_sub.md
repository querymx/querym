DATE_SUB(date,INTERVAL expr unit)

These functions perform date arithmetic. The date argument specifies the starting date or datetime value. expr is an expression specifying the interval value to be added or subtracted from the starting date. expr is evaluated as a string; it may start with a - for negative intervals. unit is a keyword indicating the units in which the expression should be interpreted.

```
SELECT DATE_SUB('2018-05-01',INTERVAL 1 YEAR);
-> '2017-05-01'
```
