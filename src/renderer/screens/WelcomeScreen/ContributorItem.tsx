import { useCallback } from 'react';
import { ProjectContributor } from './Contributors';

export default function ContributorItem({
  contributor,
}: {
  contributor: ProjectContributor;
}) {
  const onClick = useCallback(() => {
    window.electron.openExternal(contributor.link);
  }, [contributor.link]);

  return (
    <li onClick={onClick}>
      <figure>
        <img src={contributor.picture} alt="" />
        <figcaption>
          <strong>{contributor.name}</strong>
          <small>{contributor.title}</small>
        </figcaption>
      </figure>
    </li>
  );
}
