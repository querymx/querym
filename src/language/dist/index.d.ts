import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { Extension } from '@codemirror/state';
import { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete';

declare function genericCompletion(handler: (context: CompletionContext, tree: SyntaxNode) => CompletionResult | null): CompletionSource;
type SQLDialectSpec = {
    keywords?: string;
    builtin?: string;
    types?: string;
    backslashEscapes?: boolean;
    hashComments?: boolean;
    slashComments?: boolean;
    spaceAfterDashes?: boolean;
    doubleDollarQuotedStrings?: boolean;
    doubleQuotedStrings?: boolean;
    charSetCasts?: boolean;
    operatorChars?: string;
    specialVar?: string;
    identifierQuotes?: string;
    unquotedBitLiterals?: boolean;
    treatBitsAsBytes?: boolean;
};
declare class SQLDialect {
    readonly language: LRLanguage;
    readonly spec: SQLDialectSpec;
    private constructor();
    get extension(): Extension;
    static define(spec: SQLDialectSpec): SQLDialect;
}
interface SQLConfig {
    dialect?: SQLDialect;
    schema?: {
        [table: string]: readonly (string | Completion)[];
    };
    tables?: readonly Completion[];
    schemas?: readonly Completion[];
    defaultTable?: string;
    defaultSchema?: string;
    upperCaseKeywords?: boolean;
}
declare function keywordCompletionSource(dialect: SQLDialect, upperCase?: boolean): CompletionSource;
declare function sql(config?: SQLConfig): LanguageSupport;
declare const StandardSQL: SQLDialect;
declare const PostgreSQL: SQLDialect;
declare const MySQL: SQLDialect;
declare const MariaSQL: SQLDialect;
declare const MSSQL: SQLDialect;
declare const SQLite: SQLDialect;
declare const Cassandra: SQLDialect;
declare const PLSQL: SQLDialect;

export { Cassandra, MSSQL, MariaSQL, MySQL, PLSQL, PostgreSQL, SQLConfig, SQLDialect, SQLDialectSpec, SQLite, StandardSQL, genericCompletion, keywordCompletionSource, sql };
