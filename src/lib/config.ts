/** Site-wide links; reviewed product metadata lives in apps.ts. */
export const site = {
  name: 'OpenStruct',
  websiteRepository: 'https://github.com/ricardocorsini/openstruct-front',
  developmentPath: '/development',
  discord: import.meta.env.VITE_DISCORD_URL || '',
};

/** Optional integrations do not change official repositories or product availability. */
export const appIntegrations: Record<string, { webUrl: string }> = {
  consolostruct: {
    webUrl: import.meta.env.VITE_CONSOLOSTRUCT_URL || '',
  },
  molastruct: {
    webUrl: import.meta.env.VITE_MOLASTRUCT_URL || '',
  },
};
