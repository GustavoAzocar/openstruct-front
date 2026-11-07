/** Site-wide links; reviewed product metadata lives in apps.ts. */
export const site = {
  name: 'OpenStruct',
  repository: 'https://github.com/ricardocorsini/openstruct-front',
  organization: 'https://github.com/ricardocorsini',
  discord: import.meta.env.VITE_DISCORD_URL || '',
};

/** Optional integrations do not change official repositories or product availability. */
export const appIntegrations: Record<string, { webUrl: string; downloadUrl: string }> = {
  consolostruct: {
    webUrl: import.meta.env.VITE_CONSOLOSTRUCT_URL || '',
    downloadUrl: import.meta.env.VITE_CONSOLOSTRUCT_DOWNLOAD_URL || '',
  },
  molastruct: {
    webUrl: import.meta.env.VITE_MOLASTRUCT_URL || '',
    downloadUrl: import.meta.env.VITE_MOLASTRUCT_DOWNLOAD_URL || '',
  },
};
