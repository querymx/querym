import { PropsWithChildren, useEffect, useState } from 'react';
import { useSqlExecute } from './SqlExecuteProvider';
import {
  BeforeAllEventCallback,
  SqlProtectionLevel,
  SqlStatement,
} from 'libs/SqlRunnerManager';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';

export default function SqlProtectionProvider({ children }: PropsWithChildren) {
  const { runner } = useSqlExecute();
  const [openSafetyConfirmation, setOpenSafetyConfirmation] = useState(false);
  const [confirmPromise, setConfirmPromise] = useState<{
    resolve?: (v: boolean) => void;
    reject?: (reason: string) => void;
  }>({});
  const [confirmStatements, setConfirmStatements] = useState<SqlStatement[]>(
    []
  );

  useEffect(() => {
    const cb: BeforeAllEventCallback = async (safetyLevel, statements) => {
      if (safetyLevel === SqlProtectionLevel.None) {
        return true;
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
