CONV(N,from_base,to_base)

Converts numbers between different number bases. Returns a string representation of the number N, converted from base from_base to base to_base. Returns NULL if any argument is NULL.

---

**Examples:**

```
SELECT CONV('a',16,2);
-> '1010'

SELECT CONV('6E',18,8);
-> '172'
```

