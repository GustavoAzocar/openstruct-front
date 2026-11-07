import type { ProductAvailability } from './catalog-store.ts';
import { PRODUCT_POLICIES } from './catalog-trust.ts';
import type { CatalogProductId } from './catalog-trust.ts';
import { detectDesktopPlatform } from './launcher.ts';

export const LAUNCHER_INSTALL_LABEL = 'Instalar pelo Struct Launcher';

export function productReleasesUrl(id: string): string {
  if (!Object.hasOwn(PRODUCT_POLICIES, id)) throw new Error('Produto sem distribuição autorizada.');
  return `https://github.com/${PRODUCT_POLICIES[id as CatalogProductId].releaseRepo}/releases`;
}

/** Presentation only: the input comes from the shared, cryptographically verified catalog. */
export function manualInstallationOptions(
  product: ProductAvailability | undefined,
  userAgent: string,
) {
  const release = product?.status === 'ready' ? product.release : undefined;
  const preferred = detectDesktopPlatform(userAgent);
  const packages = (release?.assets ?? []).map((asset) => ({
    asset,
    system: asset.platform === 'windows' ? 'Windows' : 'Linux',
    format: asset.kind === 'nsis' ? '.exe / NSIS' : '.AppImage',
    size: `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(asset.size / 1_048_576)} MiB`,
    suggested: preferred === asset.platform && asset.arch === 'x86_64',
  }));
  return {
    release,
    packages,
    deviceHint: packages.some((pkg) => pkg.suggested)
      ? 'O sistema sugerido é apenas uma indicação. Escolha o computador de destino.'
      : 'Não identificamos um pacote para este dispositivo. Você pode baixar os arquivos para outro computador com o sistema e a arquitetura indicados.',
  };
}

export async function copyOfficialChecksum(
  hash: string,
  writeText: (value: string) => Promise<void>,
) {
  if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('SHA-256 oficial indisponível.');
  await writeText(hash);
}
