import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { acceptCompletion, completionStatus } from '@codemirror/autocomplete';
import { defaultKeymap, insertTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { SQLConfig, sql } from '@codemirror/lang-sql';
import { Ref, forwardRef } from 'react';
import useCodeEditorTheme from './useCodeEditorTheme';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  props: ReactCodeMirrorProps & { schema: SQLConfig['schema'] },
  ref: Ref<ReactCodeMirrorRef>
) {
  const { schema, ...codeMirrorProps } = props;
  const theme = useCodeEditorTheme();

  return (
    <CodeMirror
      ref={ref}
      theme={theme}
      indentWithTab={false}
      basicSetup={{ defaultKeymap: false, completionKeymap: false }}
      extensions={[
        keymap.of([
          {
            key: 'Tab',
            preventDefault: true,
            run: (target) => {
              if (completionStatus(target.state) === 'active') {
                acceptCompletion(target);
              } else {
                insertTab(target);
              }
              return true;
            },
          },
          ...defaultKeymap,
        ]),
        sql({
          schema,
        }),
      ]}
      {...codeMirrorProps}
    />
  );
});

export default SqlCodeEditor;
