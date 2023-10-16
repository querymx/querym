JSON_SCHEMA_VALIDATION_REPORT(schema,document)

Validates a JSON document against a JSON schema. Both schema and document are required. As with JSON_VALID_SCHEMA(), the schema must be a valid JSON object, and the document must be a valid JSON document. Provided that these conditions are met, the function returns a report, as a JSON document, on the outcome of the validation. If the JSON document is considered valid according to the JSON Schema, the function returns a JSON object with one property valid having the value "true". If the JSON document fails validation, the function returns a JSON object which includes the properties listed here:

- `valid`: Always "false" for a failed schema validation
- `reason`: A human-readable string containing the reason for the failure
- `schema-location`: A JSON pointer URI fragment identifier indicating where in the JSON schema the validation failed (see Note following this list)
- `document-location`: A JSON pointer URI fragment identifier indicating where in the JSON document the validation failed (see Note following this list)
- `chema-failed-keyword`: A string containing the name of the keyword or property in the JSON schema that was violated

> 
> **Note**
> SON pointer URI fragment identifiers are defined in [RFC 6901 - JavaScript Object Notation (JSON) Pointer](https://tools.ietf.org/html/rfc6901#page-5). (These are not the same as the JSON path notation used by JSON_EXTRACT() and other MySQL JSON functions.) In this notation, # represents the entire document, and #/myprop represents the portion of the document included in the top-level property named myprop. See the specification just cited and the examples shown later in this section for more information.

In this example, we set a user variable @schema to the value of a JSON schema for geographical coordinates, and another one @document to the value of a JSON document containing one such coordinate. We then verify that @document validates according to @schema by using them as the arguments to JSON_SCHEMA_VALIDATION_REORT():

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

mysql> SELECT JSON_SCHEMA_VALIDATION_REPORT(@schema, @document);
+---------------------------------------------------+
| JSON_SCHEMA_VALIDATION_REPORT(@schema, @document) |
+---------------------------------------------------+
| {"valid": true}                                   |
+---------------------------------------------------+
1 row in set (0.00 sec)
```

Now we set @document such that it specifies an illegal value for one of its properties, like this:

```
mysql> SET @document = '{
    '> "latitude": 63.444697,
    '> "longitude": 310.445118
    '> }';
```

Validation of @document now fails when tested with JSON_SCHEMA_VALIDATION_REPORT(). The output from the function call contains detailed information about the failure (with the function wrapped by JSON_PRETTY() to provide better formatting), as shown here:

```
mysql> SELECT JSON_PRETTY(JSON_SCHEMA_VALIDATION_REPORT(@schema, @document))\G
*************************** 1. row ***************************
JSON_PRETTY(JSON_SCHEMA_VALIDATION_REPORT(@schema, @document)): {
  "valid": false,
  "reason": "The JSON document location '#/longitude' failed requirement 'maximum' at JSON Schema location '#/properties/longitude'",
  "schema-location": "#/properties/longitude",
  "document-location": "#/longitude",
  "schema-failed-keyword": "maximum"
}
1 row in set (0.00 sec)
```

Since @schema contains the required attribute, we can set @document to a value that is otherwise valid but does not contain the required properties, then test it against @schema. The output of JSON_SCHEMA_VALIDATION_REPORT() shows that validation fails due to lack of a required element, like this:

```
mysql> SET @document = '{}';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT JSON_PRETTY(JSON_SCHEMA_VALIDATION_REPORT(@schema, @document))\G
*************************** 1. row ***************************
JSON_PRETTY(JSON_SCHEMA_VALIDATION_REPORT(@schema, @document)): {
  "valid": false,
  "reason": "The JSON document location '#' failed requirement 'required' at JSON Schema location '#'",
  "schema-location": "#",
  "document-location": "#",
  "schema-failed-keyword": "required"
}
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

mysql> SELECT JSON_SCHEMA_VALIDATION_REPORT(@schema, @document);
+---------------------------------------------------+
| JSON_SCHEMA_VALIDATION_REPORT(@schema, @document) |
+---------------------------------------------------+
| {"valid": true}                                   |
+---------------------------------------------------+
1 row in set (0.00 sec)
```
