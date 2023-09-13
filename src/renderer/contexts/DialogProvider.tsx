import NotImplementCallback from 'libs/NotImplementCallback';
import {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useCallback,
} from 'react';
import Modal from 'renderer/components/Modal';

const DialogContext = createContext<{
  showErrorDialog: (message: string) => void;
}>({
  showErrorDialog: NotImplementCallback,
});

export function useDialog() {
  return useContext(DialogContext);
}

export function DialogProvider({ children }: PropsWithChildren) {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorDialog = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setShowError(true);
    },
    [setShowError, setErrorMessage]
  );

  const handleErrorClose = useCallback(() => {
    setShowError(false);
  }, [setShowError]);

  return (
    <DialogContext.Provider value={{ showErrorDialog }}>
      {children}
      <Modal open={showError} title="Error" onClose={handleErrorClose}>
        <Modal.Body>
          <p>{errorMessage}</p>
        </Modal.Body>
      </Modal>
    </DialogContext.Provider>
  );
}
