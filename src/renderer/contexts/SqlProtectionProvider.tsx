import { PropsWithChildren, useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  tomorrow,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSqlExecute } from './SqlExecuteProvider';
import { BeforeAllEventCallback } from 'libs/SqlRunnerManager';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import { SqlStatement } from 'types/SqlStatement';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { useAppFeature } from './AppFeatureProvider';

export default function SqlProtectionProvider({ children }: PropsWithChildren) {
  const { runner } = useSqlExecute();
  const { protectionLevel } = useDatabaseSetting();
  const { theme } = useAppFeature();
  const [openSafetyConfirmation, setOpenSafetyConfirmation] = useState(false);
  const [confirmPromise, setConfirmPromise] = useState<{
    resolve?: (v: boolean) => void;
    reject?: (reason: string) => void;
  }>({});
  const [confirmStatements, setConfirmStatements] = useState<SqlStatement[]>(
    []
  );

  useEffect(() => {
    const cb: BeforeAllEventCallback = async (statements, skipProtection) => {
      if (skipProtection) {
        return true;
      }

      if (protectionLevel === 0) {
        return true;
      } else if (protectionLevel === 1) {
        // If there is non-SELECT, then we need protection
        if (
          statements.some((statement) => {
            if (!statement.analyze) return false;
            return statement.analyze.type === 'select';
          })
        ) {
          return true;
        }
      }

      setConfirmStatements(statements);

      return await new Promise((resolve, reject) => {
        setConfirmPromise({ resolve, reject });
        setOpenSafetyConfirmation(true);
      });
    };

    runner.registerBeforeAll(cb);
    return () => runner.unregisterBeforeAll(cb);
  }, [
    runner,
    protectionLevel,
    setConfirmPromise,
    setConfirmStatements,
    setOpenSafetyConfirmation,
  ]);

  return (
    <>
      <Modal
        wide
        maxWidth={1000}
        open={openSafetyConfirmation}
        title="Confirm"
        onClose={() => {
          if (confirmPromise?.reject) {
            confirmPromise.reject('Cancel');
          }
          setOpenSafetyConfirmation(false);
        }}
      >
        <Modal.Body>
          <div
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
            className={'scroll'}
          >
            {confirmStatements.map((statement, idx) => (
              <div>
                <SyntaxHighlighter
                  lineProps={{
                    style: {
                      justifyContent: 'flex-start',
                      flexWrap: 'wrap',
                      position: 'relative',
                      paddingLeft: 30,
                    },
                  }}
                  lineNumberStyle={{
                    position: 'absolute',
                    left: 0,
                  }}
                  key={idx}
                  language="sql"
                  style={theme === 'dark' ? tomorrow : oneLight}
                  showLineNumbers
                  wrapLongLines
                >
                  {statement.sql}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            primary
            onClick={() => {
              if (confirmPromise?.resolve) {
                confirmPromise.resolve(true);
                setOpenSafetyConfirmation(false);
              }
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      {children}
    </>
  );
}
