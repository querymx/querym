export default function ConnectionListError({
  refresh,
}: {
  refresh: () => void;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1rem',
        paddingTop: '5rem',
      }}
    >
      <p>There is something wrong</p>

      <a
        onClick={refresh}
        style={{ cursor: 'pointer', color: 'var(--color-critical)' }}
      >
        Retry
      </a>
    </div>
  );
}
