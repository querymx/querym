FROM_UNIXTIME(unix_timestamp[,format])

Returns a representation of unix_timestamp as a datetime or character string value. The value returned is expressed using the session time zone.

If format is omitted, this function returns a DATETIME value.

```
SELECT FROM_UNIXTIME(1447430881);
-> '2015-11-13 10:08:01'

SELECT FROM_UNIXTIME(1447430881,'%Y %D %M %h:%i:%s %x');
-> '2015 13th November 10:08:01 2015'
```
