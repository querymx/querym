EXTRACT(unit FROM date)

The EXTRACT() function uses the same kinds of unit specifiers as DATE_ADD() or DATE_SUB(), but extracts parts from the date rather than performing date arithmetic. For information on the unit argument, see Temporal Intervals. Returns NULL if date is NULL.

**Examples**

```
SELECT EXTRACT(YEAR FROM '2019-07-02');
SELECT EXTRACT(YEAR_MONTH FROM '2019-07-02 01:02:03');
SELECT EXTRACT(DAY_MINUTE FROM '2019-07-02 01:02:03');
```
