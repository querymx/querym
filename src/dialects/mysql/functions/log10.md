LOG10(X)

Returns the base-10 logarithm of X. If X is less than or equal to 0.0E0, the function returns NULL and a warning “Invalid argument for logarithm” is reported. Returns NULL if X is NULL.

SELECT LOG10(2);
-> 0.30102999566398
