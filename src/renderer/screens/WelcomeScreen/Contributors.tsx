import useSWR from 'swr';

export interface ProjectContributor {
  id: number;
  name: string;
  title: string;
  picture: string;
  link: string;
}

export default function Contributors() {
  useSWR<{
    contributors: ProjectContributor[];
  }>('https://api.querymaster.io/v1/contributors', {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  return <div style={{ marginTop: 50 }}></div>;
}
