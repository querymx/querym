import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
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
      extensions={[
        sql({
          schema,
        }),
      ]}
      {...codeMirrorProps}
    />
  );
});

export default SqlCodeEditor;
