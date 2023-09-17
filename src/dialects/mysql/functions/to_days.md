TO_DAYS(date)

Given a date date, returns a day number (the number of days since year 0). Returns NULL if date is NULL.

```
SELECT TO_DAYS(950501);
-> 728779

SELECT TO_DAYS('2007-10-07');
-> 733321
```
