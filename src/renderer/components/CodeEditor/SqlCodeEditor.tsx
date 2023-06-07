import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { acceptCompletion, completionStatus } from '@codemirror/autocomplete';
import { defaultKeymap, insertTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { sql } from '@codemirror/lang-sql';
import { Ref, forwardRef } from 'react';
import useCodeEditorTheme from './useCodeEditorTheme';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: ReactCodeMirrorProps & { schema: any },
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
