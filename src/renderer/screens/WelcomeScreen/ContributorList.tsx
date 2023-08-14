import ContributorItem from './ContributorItem';
import styles from './styles.module.scss';
import { ProjectContributor } from './Contributors';

export default function ContributorList({
  contributors,
}: {
  contributors: ProjectContributor[];
}) {
  return (
    <ul className={styles.contributorList}>
      {contributors.map((contributor) => (
        <ContributorItem key={contributor.id} contributor={contributor} />
      ))}
    </ul>
  );
}
