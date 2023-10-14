import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { Extension } from '@codemirror/state';
import { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete';

declare function genericCompletion(handler: (context: CompletionContext, tree: SyntaxNode) => CompletionResult | null): CompletionSource;
/**
Configuration for an [SQL Dialect](https://codemirror.net/6/docs/ref/#lang-sql.SQLDialect).
*/
type SQLDialectSpec = {
    /**
    A space-separated list of keywords for the dialect.
    */
    keywords?: string;
    /**
    A space-separated string of built-in identifiers for the dialect.
    */
    builtin?: string;
    /**
    A space-separated string of type names for the dialect.
    */
    types?: string;
    /**
    Controls whether regular strings allow backslash escapes.
    */
    backslashEscapes?: boolean;
    /**
    Controls whether # creates a line comment.
    */
    hashComments?: boolean;
    /**
    Controls whether `//` creates a line comment.
    */
    slashComments?: boolean;
    /**
    When enabled `--` comments are only recognized when there's a
    space after the dashes.
    */
    spaceAfterDashes?: boolean;
    /**
    When enabled, things quoted with "$$" are treated as
    strings, rather than identifiers.
    */
    doubleDollarQuotedStrings?: boolean;
    /**
    When enabled, things quoted with double quotes are treated as
    strings, rather than identifiers.
    */
    doubleQuotedStrings?: boolean;
    /**
    Enables strings like `_utf8'str'` or `N'str'`.
    */
    charSetCasts?: boolean;
    /**
    The set of characters that make up operators. Defaults to
    `"*+\-%<>!=&|~^/"`.
    */
    operatorChars?: string;
    /**
    The set of characters that start a special variable name.
    Defaults to `"?"`.
    */
    specialVar?: string;
    /**
    The characters that can be used to quote identifiers. Defaults
    to `"\""`.
    */
    identifierQuotes?: string;
    /**
    Controls whether bit values can be defined as 0b1010. Defaults
    to false.
    */
    unquotedBitLiterals?: boolean;
    /**
    Controls whether bit values can contain other characters than 0 and 1.
    Defaults to false.
    */
    treatBitsAsBytes?: boolean;
};
/**
Represents an SQL dialect.
*/
declare class SQLDialect {
    /**
    The language for this dialect.
    */
    readonly language: LRLanguage;
    /**
    The spec used to define this dialect.
    */
    readonly spec: SQLDialectSpec;
    private constructor();
    /**
    Returns the language for this dialect as an extension.
    */
    get extension(): Extension;
    /**
    Define a new dialect.
    */
    static define(spec: SQLDialectSpec): SQLDialect;
}
/**
Options used to configure an SQL extension.
*/
interface SQLConfig {
    /**
    The [dialect](https://codemirror.net/6/docs/ref/#lang-sql.SQLDialect) to use. Defaults to
    [`StandardSQL`](https://codemirror.net/6/docs/ref/#lang-sql.StandardSQL).
    */
    dialect?: SQLDialect;
    /**
    An object that maps table names, optionally prefixed with a
    schema name (`"schema.table"`) to options (columns) that can be
    completed for that table. Use lower-case names here.
    */
    schema?: {
        [table: string]: readonly (string | Completion)[];
    };
    /**
    By default, the completions for the table names will be
    generated from the `schema` object. But if you want to
    customize them, you can pass an array of completions through
    this option.
    */
    tables?: readonly Completion[];
    /**
    Similar to `tables`, if you want to provide completion objects
    for your schemas rather than using the generated ones, pass them
    here.
    */
    schemas?: readonly Completion[];
    /**
    When given, columns from the named table can be completed
    directly at the top level.
    */
    defaultTable?: string;
    /**
    When given, tables prefixed with this schema name can be
    completed directly at the top level.
    */
    defaultSchema?: string;
    /**
    When set to true, keyword completions will be upper-case.
    */
    upperCaseKeywords?: boolean;
}
/**
Returns a completion source that provides keyword completion for
the given SQL dialect.
*/
declare function keywordCompletionSource(dialect: SQLDialect, upperCase?: boolean): CompletionSource;
/**
SQL language support for the given SQL dialect, with keyword
completion, and, if provided, schema-based completion as extra
extensions.
*/
declare function sql(config?: SQLConfig): LanguageSupport;
/**
The standard SQL dialect.
*/
declare const StandardSQL: SQLDialect;
/**
Dialect for [PostgreSQL](https://www.postgresql.org).
*/
declare const PostgreSQL: SQLDialect;
/**
[MySQL](https://dev.mysql.com/) dialect.
*/
declare const MySQL: SQLDialect;
/**
Variant of [`MySQL`](https://codemirror.net/6/docs/ref/#lang-sql.MySQL) for
[MariaDB](https://mariadb.org/).
*/
declare const MariaSQL: SQLDialect;
/**
SQL dialect for Microsoft [SQL
Server](https://www.microsoft.com/en-us/sql-server).
*/
declare const MSSQL: SQLDialect;
/**
[SQLite](https://sqlite.org/) dialect.
*/
declare const SQLite: SQLDialect;
/**
Dialect for [Cassandra](https://cassandra.apache.org/)'s SQL-ish query language.
*/
declare const Cassandra: SQLDialect;
/**
[PL/SQL](https://en.wikipedia.org/wiki/PL/SQL) dialect.
*/
declare const PLSQL: SQLDialect;

export { Cassandra, MSSQL, MariaSQL, MySQL, PLSQL, PostgreSQL, SQLConfig, SQLDialect, SQLDialectSpec, SQLite, StandardSQL, genericCompletion, keywordCompletionSource, sql };
