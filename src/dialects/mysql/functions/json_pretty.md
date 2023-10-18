JSON_PRETTY(json_val)

Provides pretty-printing of JSON values similar to that implemented in PHP and by other languages and database systems. The value supplied must be a JSON value or a valid string representation of a JSON value. Extraneous whitespaces and newlines present in this value have no effect on the output. For a NULL value, the function returns NULL. If the value is not a JSON document, or if it cannot be parsed as one, the function fails with an error.

Formatting of the output from this function adheres to the following rules:

- Each array element or object member appears on a separate line, indented by one additional level as compared to its parent.
- Each level of indentation adds two leading spaces.
- A comma separating individual array elements or object members is printed before the newline that separates the two elements or members.
- The key and the value of an object member are separated by a colon followed by a space (': ').
- An empty object or array is printed on a single line. No space is printed between the opening and closing brace.
- Special characters in string scalars and key names are escaped employing the same rules used by the JSON_QUOTE() function.

```
mysql> SELECT JSON_PRETTY('123'); # scalar
+--------------------+
| JSON_PRETTY('123') |
+--------------------+
| 123                |
+--------------------+

mysql> SELECT JSON_PRETTY("[1,3,5]"); # array
+------------------------+
| JSON_PRETTY("[1,3,5]") |
+------------------------+
| [
  1,
  3,
  5
]      |
+------------------------+

mysql> SELECT JSON_PRETTY('{"a":"10","b":"15","x":"25"}'); # object
+---------------------------------------------+
| JSON_PRETTY('{"a":"10","b":"15","x":"25"}') |
+---------------------------------------------+
| {
  "a": "10",
  "b": "15",
  "x": "25"
}   |
+---------------------------------------------+

mysql> SELECT JSON_PRETTY('["a",1,{"key1":
    '>    "value1"},"5",     "77" ,
    '>       {"key2":["value3","valueX",
    '> "valueY"]},"j", "2"   ]')\G  # nested arrays and objects
*************************** 1. row ***************************
JSON_PRETTY('["a",1,{"key1":
             "value1"},"5",     "77" ,
                {"key2":["value3","valuex",
          "valuey"]},"j", "2"   ]'): [
  "a",
  1,
  {
    "key1": "value1"
  },
  "5",
  "77",
  {
    "key2": [
      "value3",
      "valuex",
      "valuey"
    ]
  },
  "j",
  "2"
]
```

