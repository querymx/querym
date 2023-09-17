CRC32(expr)

Computes a cyclic redundancy check value and returns a 32-bit unsigned value. The result is NULL if the argument is NULL. The argument is expected to be a string and (if possible) is treated as one if it is not.

---

**Examples:**

```
SELECT CRC32('MySQL');
-> 3259397556
```
