import useSWR from 'swr';
import ContributorList from './ContributorList';

export interface ProjectContributor {
  id: number;
  name: string;
  title: string;
  picture: string;
  link: string;
}

export default function Contributors() {
  const { data } = useSWR<{
    contributors: ProjectContributor[];
  }>('https://api.querymaster.io/v1/contributors', {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  return (
    <div style={{ marginTop: 50 }}>
      <h3>Contributors</h3>
      <p>This project will not be possible without our valuable contributors</p>
    </div>
  );
}
