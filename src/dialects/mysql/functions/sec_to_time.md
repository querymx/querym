SEC_TO_TIME(seconds)

Returns the seconds argument, converted to hours, minutes, and seconds, as a TIME value. The range of the result is constrained to that of the TIME data type. A warning occurs if the argument corresponds to a value outside that range.

The function returns NULL if seconds is NULL.

```
SELECT SEC_TO_TIME(2378);
-> '00:39:38'

SELECT SEC_TO_TIME(2378) + 0;
-> 3938
```
