import axios from 'axios';

import { InternalServerErrorException } from '../common/errorHandler';
import { getProjectsInOrg } from './checks.utils';

export const getMfaData = async (orgId: string, accessToken: string) => {
  const { data } = await axios.get<{ user_name: string; mfa_enabled: boolean }[]>(
    `https://api.supabase.com/v1/organizations/${orgId}/members`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const users = data.map((member) => ({
    userName: member.user_name,
    mfaEnabled: member.mfa_enabled,
  }));

  return users;
};

export const getRlsData = async (orgId: string, accessToken: string) => {
  const projects = await getProjectsInOrg(orgId, accessToken);

  // Sequentially fetch the backup history for each project
  // It is intentionally done this way to avoid rate limiting
  const rlsData = await Promise.all(
    projects.map(async (project: { id: string }) => {
      const data = JSON.stringify({
        query:
          "SELECT n.nspname AS schema, c.relname AS table_name, c.relrowsecurity AS rls_enabled FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind = 'r';",
      });

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${project.id}/database/query`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        },
      );
      if (!response.ok) {
        throw new InternalServerErrorException('Failed to fetch tables data');
      }
      const tablesData = await response.json();
      return tablesData.map(
        (table: { table_name: string; schema: string; rls_enabled: boolean }) => ({
          projectId: project.id,
          tableName: table.table_name,
          schema: table.schema,
          rlsEnabled: table.rls_enabled,
        }),
      );
    }),
  );

  const finalRlsData = rlsData.flat();

  return finalRlsData;
};

export const getPitrData = async (orgId: string, accessToken: string) => {
  const projects = await getProjectsInOrg(orgId, accessToken);

  // Sequentially fetch the backup history for each project
  // It is intentionally done this way to avoid rate limiting
  const pitrData = await Promise.all(
    projects.map(async (project: { id: string }) => {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${project.id}/database/backups`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!response.ok) {
        console.log(response);
        throw new InternalServerErrorException('Failed to fetch backup history');
      }
      const backupData = await response.json();
      return { projectId: project.id, pitrEnabled: backupData.pitr_enabled };
    }),
  );

  return pitrData;
};
