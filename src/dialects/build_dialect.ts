import fs from 'fs';
import path from 'path';
import { TooltipDirectionary } from 'renderer/components/CodeEditor/functionTooltips';
import showdown from 'showdown';

function readKeywordsFromFile(file: string): string[] {
  const keywords = fs
    .readFileSync(file)
    .toString()
    .split('\n')
    .map((r) => r.trim());

  return keywords;
}

function build_dialect(folderName: string) {
  const functionFiles = fs.readdirSync(
    path.join(__dirname, folderName, 'functions')
  );
  const functions: TooltipDirectionary = {};

  const mdConverter = new showdown.Converter({ tables: true });
  for (const functionFile of functionFiles) {
    const mdContent = fs
      .readFileSync(path.join(__dirname, folderName, 'functions', functionFile))
      .toString();

    const mdContentLines = mdContent.split('\n');

    functions[path.parse(functionFile).name] = {
      syntax: mdContentLines[0],
      description: mdConverter.makeHtml(mdContentLines.slice(2).join('\n')),
    };
  }

  fs.writeFileSync(
    path.join(__dirname, folderName, 'suggestion.json'),
    JSON.stringify(functions, undefined, 2)
  );

  const baseKeywords = readKeywordsFromFile(
    path.join(__dirname, 'keywords.txt')
  );
  const baseTypes = readKeywordsFromFile(path.join(__dirname, 'types.txt'));

  const dialectKeywords = readKeywordsFromFile(
    path.join(__dirname, folderName, 'keywords.txt')
  );

  const dialectTypes = readKeywordsFromFile(
    path.join(__dirname, folderName, 'types.txt')
  );

  const combinedKeywords = Array.from(
    new Set([...baseKeywords, ...dialectKeywords, ...Object.keys(functions)])
  );

  const combinedTypes = Array.from(new Set([...baseTypes, ...dialectTypes]));

  const rules = JSON.parse(
    fs.readFileSync(path.join(__dirname, folderName, 'rules.json')).toString()
  );

  const dialect = {
    ...rules,
    keywords: combinedKeywords.join(' '),
    types: combinedTypes.join(' '),
  };

  fs.writeFileSync(
    path.join(__dirname, folderName, 'dialect.json'),
    JSON.stringify(dialect, undefined, 2)
  );
}

build_dialect('mysql');
build_dialect('pg');
