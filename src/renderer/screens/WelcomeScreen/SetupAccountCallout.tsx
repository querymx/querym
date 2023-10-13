import Button from 'renderer/components/Button';
import styles from './styles.module.scss';
import Stack from 'renderer/components/Stack';
import {
  LoginUser,
  useAuth,
  useCurrentUser,
} from 'renderer/contexts/AuthProvider';
import PasswordField from 'renderer/components/PasswordField';
import { useCallback, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import LinkButton from 'renderer/components/Button/LinkButton';
import ButtonGroup from 'renderer/components/ButtonGroup';

function SetupAccountNotLogin() {
  return (
    <div>
      <h2>Setup Account</h2>

      <p>Link with your GitHub account to share your work across devices.</p>

      <p>
        <strong>It is safe!</strong> All your database credientials are
        encrypted using your own master password. We don't store your master
        password.
      </p>

      <Stack>
        <Button
          onClick={() => {
            window.electron.openExternal('https://api.querymaster.io/v1/login');
          }}
          primary
          icon={
            <svg
              width="16px"
              height="16px"
              viewBox="0 0 256 250"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
            >
              <g>
                <path
                  d="M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z"
                  fill="#fff"
                ></path>
              </g>
            </svg>
          }
        >
          Connect with GitHub
        </Button>
      </Stack>
    </div>
  );
}

function SetupMasterPasswordInstruction() {
  return (
    <>
      <p>
        Provide us with your master password. It will be used for encrypt and
        decrypt your credentials before save on our server.
      </p>
      <ul>
        <li>We do not store your master password on our server.</li>
        <li>
          Forget your master password means that you will also lose your saved
          data
        </li>
      </ul>
    </>
  );
}

function SetupAccountNewMasterKey({ user }: { user: LoginUser }) {
  const { api, setMasterPassword } = useAuth();
  const { refetch } = useCurrentUser();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState('');

  const onSetupPassword = useCallback(() => {
    if (password === confirmed) {
      setMasterPassword(password);
      api.updateMasterPassword(password).then(() => refetch);
    }
  }, [password, setMasterPassword, confirmed]);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>

      <SetupMasterPasswordInstruction />

      <Stack vertical spacing="sm">
        <PasswordField
          autoFocus
          placeholder="Master password"
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          autoFocus
          placeholder="Confirm master password"
          value={confirmed}
          onChange={setConfirmed}
        />

        <Button primary onClick={onSetupPassword}>
          Setup Master Password
        </Button>
      </Stack>
    </div>
  );
}

function SetupAccountExistingMasterKey({ user }: { user: LoginUser }) {
  const { setMasterPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);

  const onCheckMasterPassword = useCallback(() => {
    if (user.test_encryption) {
      window.electron
        .decrypt(user.test_encryption, password, user.salt)
        .then((decryptedText: string) => {
          if (decryptedText === user.salt) {
            setErrorMessage('');
            setMasterPassword(password);
          } else {
            setErrorMessage('Not correct password');
          }
        });
    }
  }, [setErrorMessage, password]);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>

      <SetupMasterPasswordInstruction />

      {!!errorMessage && (
        <p style={{ color: 'var(--color-critical)' }}>
          <strong>Error</strong>: {errorMessage}
        </p>
      )}

      <PasswordField
        ref={passwordRef}
        autoFocus
        placeholder="Master password"
        value={password}
        onChange={setPassword}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onCheckMasterPassword();
          }
        }}
      />
      <p></p>
      <Button primary onClick={onCheckMasterPassword}>
        Enter
      </Button>
    </div>
  );
}

function SetupAccountChangePassword({ onClose }: { onClose: () => void }) {
  const { api, setMasterPassword: setPersistentPassword } = useAuth();
  const { refetch } = useCurrentUser();
  const [oldMasterPassword, setOldMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChangePassword = useCallback(() => {
    if (!masterPassword) {
      setError('Please enter valid master password.');
      return;
    }

    if (confirmMasterPassword !== masterPassword) {
      setError('The password is not matched');
      return;
    }

    setLoading(true);
    api
      .updateMasterPassword(masterPassword, oldMasterPassword)
      .then((resp) => {
        if (resp.status) {
          setPersistentPassword(masterPassword);
          refetch();
          onClose();
        } else {
          setError(resp.error?.message ?? '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [
    setPersistentPassword,
    oldMasterPassword,
    confirmMasterPassword,
    onClose,
    setLoading,
    refetch,
  ]);

  return (
    <div>
      {error && (
        <p style={{ color: 'var(--color-critical)' }}>
          <strong>Error</strong>: {error}
        </p>
      )}

      {loading && (
        <p>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>&nbsp;Changing password...</span>
        </p>
      )}

      <Stack vertical spacing="sm">
        <PasswordField
          autoFocus
          placeholder="Old master password"
          value={oldMasterPassword}
          onChange={setOldMasterPassword}
        />

        <PasswordField
          placeholder="New Master password"
          value={masterPassword}
          onChange={setMasterPassword}
        />

        <PasswordField
          placeholder="Confirm master password"
          value={confirmMasterPassword}
          onChange={setConfirmMasterPassword}
        />

        <ButtonGroup>
          <Button primary onClick={onChangePassword} disabled={loading}>
            Change Password
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ButtonGroup>
      </Stack>
    </div>
  );
}

function SetupAccountComplete({ user }: { user: LoginUser }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (showChangePassword) {
    return (
      <SetupAccountChangePassword
        onClose={() => {
          setShowChangePassword(false);
        }}
      />
    );
  }

  return (
    <Stack>
      <div>
        <FontAwesomeIcon
          icon={faCheckCircle}
          color="#27ae60"
          style={{ fontSize: 30 }}
        />
      </div>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome, {user.name}</h2>
        <p>Your account is secured with your master password.</p>

        <ul>
          <li>
            <LinkButton
              text="Change new master password"
              onClick={() => setShowChangePassword(true)}
            />
          </li>
        </ul>
      </div>
    </Stack>
  );
}

function SetupAccountDetail({ user }: { user: LoginUser }) {
  const { isValidMasterPassword } = useCurrentUser();

  if (isValidMasterPassword) {
    return <SetupAccountComplete user={user} />;
  } else if (user.test_encryption) {
    return <SetupAccountExistingMasterKey user={user} />;
  } else {
    return <SetupAccountNewMasterKey user={user} />;
  }
}

export default function SetupAccountCallout() {
  const { logout } = useAuth();
  const { user } = useCurrentUser();

  return (
    <div className={styles.calloutBackground}>
      <div className={styles.calloutContainer}>
        <div>
          {user ? <SetupAccountDetail user={user} /> : <SetupAccountNotLogin />}
        </div>
        {user && (
          <div className={styles.footer}>
            <LinkButton text="Logout" destructive onClick={logout} />
          </div>
        )}
      </div>
    </div>
  );
}
