FIND_IN_SET(str,strlist)

Returns a value in the range of 1 to N if the string str is in the string list `strlist` consisting of N substrings. A string list is a string composed of substrings separated by characters. If the first argument is a constant string and the second is a column of type SET, the FIND_IN_SET() function is optimized to use bit arithmetic. Returns 0 if str is not in `strlist` or if `strlist` is the empty string. Returns NULL if either argument is NULL. This function does not work properly if the first argument contains a comma (,) character.

```
mysql> SELECT FIND_IN_SET('b','a,b,c,d');
        -> 2
```
