UNIX_TIMESTAMP([date])

If UNIX_TIMESTAMP() is called with no date argument, it returns a Unix timestamp representing seconds since '1970-01-01 00:00:00' UTC.

If UNIX_TIMESTAMP() is called with a date argument, it returns the value of the argument as seconds since '1970-01-01 00:00:00' UTC. The server interprets date as a value in the session time zone and converts it to an internal Unix timestamp value in UTC. 

```
SELECT UNIX_TIMESTAMP();
-> 1447431666

SELECT UNIX_TIMESTAMP('2015-11-13 10:20:19');
-> 1447431619

SELECT UNIX_TIMESTAMP('2015-11-13 10:20:19.012');
-> 1447431619.012
```
