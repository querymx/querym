# QueryMaster - Yet Another Database GUI

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=invisal_query-master) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=invisal_query-master)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=invisal_query-master)

Query Master is a free, open-source, and cross-platform GUI tool for databases. Although this project is relatively young, we are ambitious in our goal to create one of the best tools available. Currently, it only supports MySQL, but we plan to add support for other relational databases by 2024.

[Download Windows Version](https://apps.microsoft.com/store/detail/querymaster/9PBF90B3T7Z2?hl=en-us&gl=us) | [Download Mac Version](https://github.com/invisal/query-master/releases)

<div style="height: 10px"></div>

![QueryMaster](https://i.ibb.co/6ybwWYy/animated2.gif)

## Roadmap and Features

These are the features that we have either completed or plan to complete. Currently, we have finished approximately 20% of our initial roadmap.

### Writing SQL

QueryMaster aims to provide the best experience for writing SQL, which includes the following features:

- Smart autocomplete
    - ✅ Automatically completes database, table, and column names.
    - ✅ Detects ENUM columns and provides auto-completion.
    - ❌ Auto-completes aliased tables.
    - ❌ Analyzes sub-queries and provides auto-completion for their columns.
    - ✅ Provides hints and function usage.
- Code formatter
    - ✅ Beautifies your SQL code.
    - ❌ Allows customization of the beautify style.
- Support for variables
    - ❌ Allows developers to bind values to variables, making queries more reusable.

### Running Queries

- Protection and Review
    - ✅ QueryMaster offers three levels of protection mode. Review your SQL before running any query that can greatly impact your database.
- Kill query
    - ✅ Terminate the query before it finishes running. It is good for canceling long-running queries.
- Multiple queries result
    - ✅ Run multiple queries and see all of their results in separate tabs.
- Saved Queries
    - ✅ Save your queries with a name to use later.
- Query History
    - ❌ Record the browser queries that you used to run.

### Data Editor

- ✅ Edit data within the data editor.
- ✅ Edit data even if it is a result of an INNER JOIN.
- ✅ Add rows.
- ✅ Remove rows.
- ✅ We provide a JSON editor.
- ❌ Preview geometry data visually on a map.
- ✅ Preview changes before committing them.
- ✅ You can discard any changes made.

### Export and Import Data

- ✅ Export to CSV
- ✅ Export to Microsoft Excel
- ❌ Export to JSON
- ❌ Export to SQL
- ❌ Export to XML
- ❌ Export to Clipboard
- ❌ Import from CSV
- ❌ Import from Excel
- ❌ Import from SQL

### Connection Management

- ✅ Manage your connections in nested folders.
- ✅ MySQL Support
- ❌ SQLite Support
- ❌ PostgreSQL Support
- ❌ Oracle Support
- ❌ Microsoft SQL Support
- ❌ Cassandra 

### Editing Schema

- ❌ Create and drop database
- ❌ Create/Edit/Remove table
- ❌ Create/Edit/Remove stored procedure
- ❌ Create/Edit/Remove trigger
- ❌ Create/Edit/Remove event

### Monitor and Management

- ❌ Manage users
- ❌ Monitor and kill process

### Visualization
- ❌ Visualize data in a chart.

### Cloud Feature
- ❌ Add E2E password encryption
- ❌ Store your connections in the cloud
- ❌ Store your saved queries
