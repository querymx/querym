import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { useTheme } from 'renderer/contexts/ThemeProvider';
import { useMemo } from 'react';

export default function useCodeEditorTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    if (theme === 'light') {
      return createTheme({
        theme: 'light',
        settings: {
          background: '#ffffff',
          foreground: '#000',
          caret: '#AEAFAD',
          selection: '#f1c40f',
          selectionMatch: '#f1c40f',
          gutterBackground: '#FFFFFF',
          gutterForeground: '#4D4D4C',
          gutterBorder: '#fff',
          gutterActiveForeground: '#000',
        },
        styles: [
          { tag: t.keyword, color: '#2980b9' },
          { tag: t.comment, color: '#27ae60' },
          { tag: t.definition(t.typeName), color: '#27ae60' },
          { tag: t.typeName, color: '#194a7b' },
          { tag: t.tagName, color: '#008a02' },
          { tag: t.variableName, color: '#1a00db' },
        ],
      });
    } else {
      return createTheme({
        theme: 'dark',
        settings: {
          background: 'var(--color-surface)',
          foreground: 'var(--color-text)',
          caret: '#AEAFAD',
          selection: '#f1c40f',
          selectionMatch: '#f1c40f',
          gutterBackground: 'var(--color-surface)',
          gutterForeground: 'var(--color-text)',
          gutterBorder: '#fff',
          gutterActiveForeground: 'var(--color-text)',
        },
        styles: [
          { tag: t.keyword, color: '#2980b9' },
          { tag: t.comment, color: '#27ae60' },
          { tag: t.definition(t.typeName), color: '#27ae60' },
          { tag: t.typeName, color: '#194a7b' },
          { tag: t.tagName, color: '#008a02' },
          { tag: t.variableName, color: '#1a00db' },
        ],
      });
    }
  }, [theme]);
}
