MAKETIME(hour,minute,second)

Returns a time value calculated from the hour, minute, and second arguments. Returns NULL if any of its arguments are NULL.

The second argument can have a fractional part.

```
SELECT MAKETIME(12,15,30);
-> '12:15:30'
```
