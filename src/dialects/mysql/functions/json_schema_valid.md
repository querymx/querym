JSON_SCHEMA_VALID(schema,document)

Validates a JSON document against a JSON schema. Both schema and document are required. The schema must be a valid JSON object; the document must be a valid JSON document. Provided that these conditions are met: If the document validates against the schema, the function returns true (1); otherwise, it returns false (0).

In this example, we set a user variable @schema to the value of a JSON schema for geographical coordinates, and another one @document to the value of a JSON document containing one such coordinate. We then verify that @document validates according to @schema by using them as the arguments to JSON_SCHEMA_VALID():

```
mysql> SET @schema = '{
    '>  "id": "http://json-schema.org/geo",
    '> "$schema": "http://json-schema.org/draft-04/schema#",
    '> "description": "A geographical coordinate",
    '> "type": "object",
    '> "properties": {
    '>   "latitude": {
    '>     "type": "number",
    '>     "minimum": -90,
    '>     "maximum": 90
    '>   },
    '>   "longitude": {
    '>     "type": "number",
    '>     "minimum": -180,
    '>     "maximum": 180
    '>   }
    '> },
    '> "required": ["latitude", "longitude"]
    '>}';
Query OK, 0 rows affected (0.01 sec)

mysql> SET @document = '{
    '> "latitude": 63.444697,
    '> "longitude": 10.445118
    '>}';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT JSON_SCHEMA_VALID(@schema, @document);
+---------------------------------------+
| JSON_SCHEMA_VALID(@schema, @document) |
+---------------------------------------+
|                                     1 |
+---------------------------------------+
1 row in set (0.00 sec)
```

Since @schema contains the required attribute, we can set @document to a value that is otherwise valid but does not contain the required properties, then test it against @schema, like this:

```
mysql> SET @document = '{}';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT JSON_SCHEMA_VALID(@schema, @document);
+---------------------------------------+
| JSON_SCHEMA_VALID(@schema, @document) |
+---------------------------------------+
|                                     0 |
+---------------------------------------+
1 row in set (0.00 sec)
```

If we now set the value of @schema to the same JSON schema but without the required attribute, @document validates because it is a valid JSON object, even though it contains no properties, as shown here:

```
mysql> SET @schema = '{
    '> "id": "http://json-schema.org/geo",
    '> "$schema": "http://json-schema.org/draft-04/schema#",
    '> "description": "A geographical coordinate",
    '> "type": "object",
    '> "properties": {
    '>   "latitude": {
    '>     "type": "number",
    '>     "minimum": -90,
    '>     "maximum": 90
    '>   },
    '>   "longitude": {
    '>     "type": "number",
    '>     "minimum": -180,
    '>     "maximum": 180
    '>   }
    '> }
    '>}';
Query OK, 0 rows affected (0.00 sec)


mysql> SELECT JSON_SCHEMA_VALID(@schema, @document);
+---------------------------------------+
| JSON_SCHEMA_VALID(@schema, @document) |
+---------------------------------------+
|                                     1 |
+---------------------------------------+
1 row in set (0.00 sec)
```

JSON_SCHEMA_VALID() and CHECK constraints.  JSON_SCHEMA_VALID() can also be used to enforce CHECK constraints.

Consider the table geo created as shown here, with a JSON column coordinate representing a point of latitude and longitude on a map, governed by the JSON schema used as an argument in a JSON_SCHEMA_VALID() call which is passed as the expression for a CHECK constraint on this table:

```
mysql> CREATE TABLE geo (
    ->     coordinate JSON,
    ->     CHECK(
    ->         JSON_SCHEMA_VALID(
    ->             '{
    '>                 "type":"object",
    '>                 "properties":{
    '>                       "latitude":{"type":"number", "minimum":-90, "maximum":90},
    '>                       "longitude":{"type":"number", "minimum":-180, "maximum":180}
    '>                 },
    '>                 "required": ["latitude", "longitude"]
    '>             }',
    ->             coordinate
    ->         )
    ->     )
    -> );
Query OK, 0 rows affected (0.45 sec)
```
> ### Note
> Because a MySQL CHECK constraint cannot contain references to variables, you must pass the JSON schema to JSON_SCHEMA_VALID() inline when using it to specify such a constraint for a table.

We assign JSON values representing coordinates to three variables, as shown here:

```
mysql> SET @point1 = '{"latitude":59, "longitude":18}';
Query OK, 0 rows affected (0.00 sec)

mysql> SET @point2 = '{"latitude":91, "longitude":0}';
Query OK, 0 rows affected (0.00 sec)

mysql> SET @point3 = '{"longitude":120}';
Query OK, 0 rows affected (0.00 sec)
```

The first of these values is valid, as can be seen in the following INSERT statement:

```
mysql> INSERT INTO geo VALUES(@point1);
Query OK, 1 row affected (0.05 sec)
```

The second JSON value is invalid and so fails the constraint, as shown here:

```
mysql> INSERT INTO geo VALUES(@point2);
ERROR 3819 (HY000): Check constraint 'geo_chk_1' is violated.
```

In MySQL 8.0.19 and later, you can obtain precise information about the nature of the failure—in this case, that the latitude value exceeds the maximum defined in the schema—by issuing a SHOW WARNINGS statement:

```
mysql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Error
   Code: 3934
Message: The JSON document location '#/latitude' failed requirement 'maximum' at
JSON Schema location '#/properties/latitude'.
*************************** 2. row ***************************
  Level: Error
   Code: 3819
Message: Check constraint 'geo_chk_1' is violated.
2 rows in set (0.00 sec)
```

The third coordinate value defined above is also invalid, since it is missing the required latitude property. As before, you can see this by attempting to insert the value into the geo table, then issuing SHOW WARNINGS afterwards:

```
mysql> INSERT INTO geo VALUES(@point3);
ERROR 3819 (HY000): Check constraint 'geo_chk_1' is violated.
mysql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Error
   Code: 3934
Message: The JSON document location '#' failed requirement 'required' at JSON
Schema location '#'.
*************************** 2. row ***************************
  Level: Error
   Code: 3819
Message: Check constraint 'geo_chk_1' is violated.
2 rows in set (0.00 sec)
```

See [Section 13.1.20.6, “CHECK Constraints”](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html), for more information.

JSON Schema has support for specifying regular expression patterns for strings, but the implementation used by MySQL silently ignores invalid patterns. This means that JSON_SCHEMA_VALID() can return true even when a regular expression pattern is invalid, as shown here:

```
mysql> SELECT JSON_SCHEMA_VALID('{"type":"string","pattern":"("}', '"abc"');
+---------------------------------------------------------------+
| JSON_SCHEMA_VALID('{"type":"string","pattern":"("}', '"abc"') |
+---------------------------------------------------------------+
|                                                             1 |
+---------------------------------------------------------------+
1 row in set (0.04 sec)
```
