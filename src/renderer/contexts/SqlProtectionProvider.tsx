import { PropsWithChildren, useEffect, useState } from 'react';
import { useSqlExecute } from './SqlExecuteProvider';
import { BeforeAllEventCallback } from 'libs/SqlRunnerManager';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import { SqlStatement } from 'types/SqlStatement';
import { useDatabaseSetting } from './DatabaseSettingProvider';

export default function SqlProtectionProvider({ children }: PropsWithChildren) {
  const { runner } = useSqlExecute();
  const { protectionLevel } = useDatabaseSetting();
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
          {confirmStatements.map((statement, idx) => (
            <pre key={idx}>
              <code>{statement.sql}</code>
            </pre>
          ))}
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
