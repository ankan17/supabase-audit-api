import { InternalServerErrorException } from '../common/errorHandler';

export const getProjectsInOrg = async (organizationId: string, accessToken: string) => {
  const response = await fetch(`https://api.supabase.com/v1/projects`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    console.log(response);
    throw new InternalServerErrorException('Failed to fetch projects');
  }
  const projects = await response.json();
  const projectsInCurrentOrg = projects.filter(
    (project: { organization_id: string }) => project.organization_id === organizationId,
  );
  return projectsInCurrentOrg;
};
