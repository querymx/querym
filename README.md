# Querym: Universal Database GUI Client

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=invisal_query-master) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=invisal_query-master)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=invisal_query-master&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=invisal_query-master)

Querym is a free, open-source, and cross-platform GUI tool designed to make database management accessible and efficient. While it's a relatively young project, our ambition is to create one of the best database management tools available. Currently, Querym offers robust support for MySQL, with plans to expand its compatibility to other relational databases by 2024.

[Download Windows Version](https://apps.microsoft.com/store/detail/querymaster/9PBF90B3T7Z2?hl=en-us&gl=us) | [Download Mac Version](https://github.com/invisal/query-master/releases)

<div style="height: 10px"></div>

![QueryMaster](https://i.ibb.co/6ybwWYy/animated2.gif)

## Features and Development Roadmap

Here's an overview of Querym's features, including completed functionalities and those on our development roadmap. Currently, we have achieved approximately 20% of our initial roadmap.

### SQL Querying

Querym aims to provide an exceptional SQL writing experience with the following features:

- **Smart Autocomplete**
  - ✅ Automatically suggests database, table, and column names.
  - ✅ Detects ENUM columns and offers auto-completion.
  - ❌ Auto-completion for aliased tables (in progress).
  - ❌ Analyzes sub-queries for column auto-completion (in progress).
  - ✅ Provides hints and function usage.
- **Code Formatter**
  - ✅ Beautifies your SQL code.
  - ❌ Allows customization of formatting style.
- **Support for Variables**
  - ❌ Allows developers to bind values to variables, enhancing query reusability.

### Running and Managing Queries

Efficiently run and manage your queries with Querym:

- **Protection and Review**
  - ✅ Querym offers three levels of protection mode, allowing you to review SQL before executing potentially impactful queries.
- **Kill Query**
  - ✅ Terminate long-running queries when needed.
- **Multiple Queries Result**
  - ✅ Execute multiple queries and view results in separate tabs.
- **Saved Queries**
  - ✅ Save your frequently used queries for future use.
- **Query History**
  - ❌ Record and access your query history for reference (in progress).

### Data Editing

Edit and manage data effortlessly with Querym:

- ✅ Edit data directly within the data editor.
- ✅ Edit data even if it results from INNER JOIN operations.
- ✅ Add and remove rows with ease.
- ✅ JSON data editing supported.
- ❌ Visual preview of geometry data on a map (in progress).
- ✅ Preview changes before committing them.
- ✅ Ability to discard any changes made.

### Export and Import Data

Effortlessly move data in and out of your database:

- ✅ Export data to CSV.
- ✅ Export data to Microsoft Excel.
- ❌ Export data to JSON (in progress).
- ❌ Export data to SQL (in progress).
- ❌ Export data to XML (in progress).
- ❌ Export to Clipboard (in progress).
- ❌ Import data from CSV (in progress).
- ❌ Import data from Excel (in progress).
- ❌ Import data from SQL (in progress).

### Connection Management

Efficiently organize and manage your database connections:

- ✅ Manage connections in nested folders.
- ✅ Robust support for MySQL.
- ❌ Support for SQLite (in progress).
- ✅ Support for PostgreSQL (in progress).
- ❌ Support for Oracle (in progress).
- ❌ Support for Microsoft SQL (in progress).
- ❌ Support for Cassandra (in progress).

### Schema Editing

Perform essential database schema operations:

- ❌ Create and drop databases.
- ❌ Create, edit, and remove tables.
- ❌ Create, edit, and remove stored procedures.
- ❌ Create, edit, and remove triggers.
- ❌ Create, edit, and remove events.

### Monitoring and Management

Keep an eye on database activities and manage processes:

- ❌ Manage users (in progress).
- ❌ Monitor and terminate processes (in progress).

### Visualization

- ❌ Explore data visually with charting features (in progress).

### Cloud Integration

- ✅ Secure your connections and access them from the cloud

### Contribution 

We hope to develop Querym into a powerful yet user-friendly database management tool, dedicated to simplifying the work of developers and addressing the data management needs of businesses. 

You can help make Querym more useful by; 
- [Fork](https://github.com/QueryMx/QueryM/fork) and work on your branch
- [PR](https://github.com/QueryMx/QueryM/pulls) back to the main branch
- [Open Issue](https://github.com/QueryMx/QueryM/issues) for any feature requests, ideas, or issue
