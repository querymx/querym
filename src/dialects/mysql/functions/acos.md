ACOS(X)

Returns the arc cosine of X, that is, the value whose cosine is X. Returns NULL if X is not in the range -1 to 1, or if X is NULL.

---

**Example:**

```
SELECT ACOS(1);
-> 0

SELECT ACOS(1.0001);
-> NULL
```
