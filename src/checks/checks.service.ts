import axios from 'axios';

import { InternalServerErrorException } from '../common/errorHandler';
import { getProjectsInOrg } from './checks.utils';

export const getMfaData = async (orgId: string, accessToken: string) => {
  const logs = [];

  logs.push({
    timestamp: new Date(),
    logGroup: 'mfa',
    logline: `Getting users in org ${orgId} for checking multi-factor authentication`,
  });

  try {
    const { data: users } = await axios.get<{ user_name: string; mfa_enabled: boolean }[]>(
      `https://api.supabase.com/v1/organizations/${orgId}/members`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    logs.push({
      timestamp: new Date(),
      logGroup: 'mfa',
      logline: `Found ${users.length} users in org ${orgId}`,
    });
    users.forEach((user) => {
      logs.push({
        timestamp: new Date(),
        logGroup: 'mfa',
        logline: `MFA status for user ${user.user_name}: ${user.mfa_enabled ? 'Enabled' : 'Disabled'}`,
      });
    });

    return {
      total: users.length,
      pass: users.filter((user) => user.mfa_enabled).length,
      fail: users.filter((user) => !user.mfa_enabled).length,
      logs,
    };
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException('Failed to fetch users');
  }
};

export const getRlsData = async (orgId: string, accessToken: string) => {
  const logs = [];

  logs.push({
    timestamp: new Date(),
    logGroup: 'rls',
    logline: `Getting projects in org ${orgId} for checking row-level security`,
  });

  const projects = await getProjectsInOrg(orgId, accessToken);

  logs.push({
    timestamp: new Date(),
    logGroup: 'rls',
    logline: `Found ${projects.length} projects in org ${orgId}. Will check row-level security for every table in each project.`,
  });

  // Break the projects into chunks of 10
  const chunks = projects.reduce(
    (acc: { [key: number]: { id: string }[] }, project: { id: string }, index: number) => {
      const chunkIndex = Math.floor(index / 10);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(project);
      return acc;
    },
    [],
  );

  const rlsData = [];

  // Go over the chunks and fetch the data, sleep for 15 seconds between chunks
  // It is intentionally done this way to avoid rate limiting
  for (const chunk of chunks) {
    const chunkRlsData = await Promise.all(
      chunk.map(async (project: { id: string }) => {
        try {
          logs.push({
            timestamp: new Date(),
            logGroup: 'rls',
            logline: `Started processing tables for project ${project.id}`,
          });

          const data = {
            query:
              "SELECT n.nspname AS schema, c.relname AS table_name, c.relrowsecurity AS rls_enabled FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind = 'r';",
          };

          const { data: tablesData } = await axios.post<
            {
              table_name: string;
              schema: string;
              rls_enabled: boolean;
            }[]
          >(`https://api.supabase.com/v1/projects/${project.id}/database/query`, data, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });
          logs.push({
            timestamp: new Date(),
            logGroup: 'rls',
            logline: `Found ${tablesData.length} tables in project: ${project.id}`,
          });
          tablesData.forEach(
            (table: { table_name: string; schema: string; rls_enabled: boolean }) => {
              logs.push({
                timestamp: new Date(),
                logGroup: 'rls',
                logline: `Status of RLS for table ${table.table_name} in schema ${table.schema}: ${table.rls_enabled ? 'Enabled' : 'Disabled'}`,
              });
            },
          );
          return tablesData.map(
            (table: { table_name: string; schema: string; rls_enabled: boolean }) => ({
              projectId: project.id,
              tableName: table.table_name,
              schema: table.schema,
              rlsEnabled: table.rls_enabled,
            }),
          );
        } catch (err) {
          console.error(err);
          throw new InternalServerErrorException('Failed to fetch tables data');
        }
      }),
    );

    rlsData.push(...chunkRlsData);
  }

  const finalRlsData = rlsData.flat();

  return {
    total: finalRlsData.length,
    pass: finalRlsData.filter((table) => table.rlsEnabled).length,
    fail: finalRlsData.filter((table) => !table.rlsEnabled).length,
    logs,
  };
};

export const getPitrData = async (orgId: string, accessToken: string) => {
  const logs = [];

  logs.push({
    timestamp: new Date(),
    logGroup: 'pitr',
    logline: `Getting projects in org ${orgId} for checking point-in-time recovery`,
  });

  const projects = await getProjectsInOrg(orgId, accessToken);

  logs.push({
    timestamp: new Date(),
    logGroup: 'pitr',
    logline: `Found ${projects.length} projects in org ${orgId}. Checking point-in-time recovery for each project.`,
  });

  // Break the projects into chunks of 10
  const chunks = projects.reduce(
    (acc: { [key: number]: { id: string }[] }, project: { id: string }, index: number) => {
      const chunkIndex = Math.floor(index / 10);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(project);
      return acc;
    },
    [],
  );

  const pitrData = [];

  // Go over the chunks and fetch the data, sleep for 15 seconds between chunks
  // It is intentionally done this way to avoid rate limiting
  for (const chunk of chunks) {
    const chunkPitrData = await Promise.all(
      chunk.map(async (project: { id: string }) => {
        try {
          logs.push({
            timestamp: new Date(),
            logGroup: 'pitr',
            logline: `Checking point-in-time recovery for project: ${project.id}`,
          });

          const { data: backupData } = await axios.get<{ pitr_enabled: boolean }>(
            `https://api.supabase.com/v1/projects/${project.id}/database/backups`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          logs.push({
            timestamp: new Date(),
            logGroup: 'pitr',
            logline: `PITR status for the backup in project ${project.id}: ${backupData.pitr_enabled ? 'Enabled' : 'Disabled'}`,
          });
          return { projectId: project.id, pitrEnabled: backupData.pitr_enabled };
        } catch (err) {
          console.error(err);
          throw new InternalServerErrorException('Failed to fetch backup history');
        }
      }),
    );

    pitrData.push(...chunkPitrData);
  }

  return {
    total: pitrData.length,
    pass: pitrData.filter((backup) => backup.pitrEnabled).length,
    fail: pitrData.filter((backup) => !backup.pitrEnabled).length,
    logs,
  };
};
