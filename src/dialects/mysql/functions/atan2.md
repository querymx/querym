ATAN2(Y,X)

Returns the arc tangent of the two variables X and Y. It is similar to calculating the arc tangent of Y / X, except that the signs of both arguments are used to determine the quadrant of the result. Returns NULL if X or Y is NULL.

---

**Example:**
```
SELECT ATAN2(PI(),0);
-> 1.5707963267949
```
