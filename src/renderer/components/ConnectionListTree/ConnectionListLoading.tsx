import SkeletonText from '../Skeleton/SkeletonText';

export default function ConnectionListLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        gap: '8px',
      }}
    >
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  );
}
