export const LAUNCHER_RELEASES_URL =
  'https://github.com/ricardocorsini/openstruct-catalog/releases';
export const LAUNCHER_FEED_URL =
  'https://raw.githubusercontent.com/ricardocorsini/openstruct-catalog/main/launcher/latest.json';

export type DesktopPlatform = 'windows' | 'linux';
export type LauncherRelease = {
  version: string;
  publishedAt: string;
  releaseUrl: string;
  downloads: Record<DesktopPlatform, { url: string; filename: string }>;
};
export type LauncherAvailability =
  { status: 'pending' } | { status: 'ready'; release: LauncherRelease };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Formato de publicação inválido.');
  }
  return value as Record<string, unknown>;
}

export function detectDesktopPlatform(userAgent: string): DesktopPlatform | null {
  if (/Android|iPhone|iPad|Mobile|aarch64|arm64|armv[5-9]|i[3-6]86|Win32/i.test(userAgent))
    return null;
  if (/Windows/i.test(userAgent)) return 'windows';
  if (/Linux|X11.*Ubuntu/i.test(userAgent) && !/CrOS/i.test(userAgent)) return 'linux';
  return null;
}

// Accept only the two complete packages published by the OpenStruct pipeline.
// Remote fields cannot send a visitor to another host, repository or version.
export function parseLauncherFeed(value: unknown): LauncherRelease {
  const feed = record(value);
  const version = feed.version;
  if (
    typeof version !== 'string' ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) ||
    version.length > 40 ||
    typeof feed.pub_date !== 'string' ||
    !Number.isFinite(Date.parse(feed.pub_date))
  ) {
    throw new Error('Versão de publicação inválida.');
  }
  const platforms = record(feed.platforms);
  const releaseUrl = `${LAUNCHER_RELEASES_URL}/tag/launcher-v${version}`;
  const download = (platform: DesktopPlatform) => {
    const asset = record(platforms[`${platform}-x86_64`]);
    const filename = `launcher-${version}-${platform}-x86_64${platform === 'windows' ? '.exe' : '.AppImage'}`;
    const expected = `${LAUNCHER_RELEASES_URL}/download/launcher-v${version}/${filename}`;
    if (
      asset.url !== expected ||
      typeof asset.signature !== 'string' ||
      asset.signature.trim().length < 40
    ) {
      throw new Error('Instalador oficial indisponível ou inválido.');
    }
    return { url: expected, filename };
  };
  return {
    version,
    publishedAt: feed.pub_date,
    releaseUrl,
    downloads: { windows: download('windows'), linux: download('linux') },
  };
}

export async function loadLauncherRelease(
  signal?: AbortSignal,
  request: typeof fetch = fetch,
): Promise<LauncherAvailability> {
  const response = await request(LAUNCHER_FEED_URL, { signal, cache: 'no-cache' });
  if (response.status === 404) return { status: 'pending' };
  if (!response.ok) throw new Error('Não foi possível consultar a publicação.');
  const text = await response.text();
  if (text.length > 100_000) throw new Error('Resposta de publicação inválida.');
  return { status: 'ready', release: parseLauncherFeed(JSON.parse(text)) };
}
