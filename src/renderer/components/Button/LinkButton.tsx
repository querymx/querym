interface LinkButtonProps {
  text: string;
  destructive?: boolean;
  onClick?: () => void;
}

export default function LinkButton({
  text,
  destructive,
  onClick,
}: LinkButtonProps) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: 'pointer',
        color: destructive ? 'var(--color-critical)' : 'var(--color-text-link)',
      }}
    >
      {text}
    </span>
  );
}
