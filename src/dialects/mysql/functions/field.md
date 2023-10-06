FIELD(str,str1,str2,str3,...)

Returns the index (position) of str in the str1, str2, str3, ... list. Returns 0 if str is not found. ,If all arguments to FIELD() are strings, all arguments are compared as strings. If all arguments are numbers, they are compared as numbers. Otherwise, the arguments are compared as double. 

```
mysql> SELECT FIELD('Bb', 'Aa', 'Bb', 'Cc', 'Dd', 'Ff');
        -> 2
mysql> SELECT FIELD('Gg', 'Aa', 'Bb', 'Cc', 'Dd', 'Ff');
        -> 0
```

If str is NULL, the return value is 0 because NULL fails equality comparison with any value. FIELD() is the complement of ELT().


