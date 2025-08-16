import type { InfoEssence, SintheticResolverInfo } from '@/tsTypes';

const infoEssenceProperties = ['projection', 'fieldArgs', 'originalInfo', 'path'];
const infoEssenceTypePredicate = (info: SintheticResolverInfo): info is InfoEssence => {
  if (!info) {
    throw new TypeError(`Arg 'info' is not defined!`);
  }

  const result = Boolean(
    (info as InfoEssence).projection &&
      (info as InfoEssence).fieldArgs &&
      (info as InfoEssence).path,
  );

  if (result && !(info as InfoEssence).originalInfo && (info as InfoEssence).path.length > 0) {
    throw new TypeError(
      `In "InfoEssence" "originalInfo" is not defined but "path" is ${info.path}!`,
    );
  }

  if (!result) {
    const definedInfoEssenceProperties = infoEssenceProperties.filter((key) => info[key]);

    if (definedInfoEssenceProperties.length > 0) {
      throw new TypeError(
        `In original "info" got incorrect propert${definedInfoEssenceProperties.length === 1 ? 'y' : 'ies'}: ${definedInfoEssenceProperties.map((str) => `"${str}"`).join(', ')}!`,
      );
    }
  }

  return result;
};

export default infoEssenceTypePredicate;
