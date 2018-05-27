import { formatNumber } from 'libphonenumber-js';
import parse from '../parse';

const formatTypes = {
  local: 'local',
  international: 'international',
  e164: 'e164'
};

export { formatTypes };

export default function format({
  phoneNumber,
  countryCode = 'US',
  areaCode = '',
  type = formatTypes.local,
  removeExtension = false,
  extensionDelimeter = ' * ',
}) {
  const {
    phoneNumber: number,
    extension,
<<<<<<< HEAD
    parsedCountry,
    parsedNumber,
=======
    country,
>>>>>>> sync from upstream (#16)
    isExtension,
    isServiceNumber,
    isValid,
    hasPlus,
  } = parse({ input: phoneNumber, countryCode });

  if (!isValid) {
    return '';
  }
  if (
    isServiceNumber ||
    isExtension
  ) {
    return number;
  }
  const isUSCA = countryCode === 'CA' || countryCode === 'US';
<<<<<<< HEAD
=======
  const withAreaCode = (!hasPlus && isUSCA && countryCode && countryCode !== '') ?
    `${areaCode}${number}` :
    number;

>>>>>>> sync from upstream (#16)
  let finalType;
  if (type === formatTypes.e164) {
    finalType = 'E.164';
  } else if (type === formatTypes.international) {
    finalType = 'International';
  } else {
    finalType = (
      // assume local
<<<<<<< HEAD
      !parsedCountry ||
      // ignore US/CA difference
      isUSCA && (parsedCountry === 'US' || parsedCountry === 'CA') ||
      parsedCountry === countryCode
=======
      !country ||
      // ignore US/CA difference
      isUSCA && (country === 'US' || country === 'CA') ||
      country === countryCode
>>>>>>> sync from upstream (#16)
    ) ?
      'National' :
      'International';
  }

<<<<<<< HEAD
  let formattedNumber;
  if (!hasPlus && isUSCA && areaCode && areaCode !== '' && number.length === 7) {
    formattedNumber = formatNumber(
      `${areaCode}${number}`,
      parsedCountry || countryCode,
      finalType,
    );
  } else if (parsedNumber) {
    formattedNumber = formatNumber(
      parsedNumber,
      parsedCountry || countryCode,
      finalType,
    );
  } else if (!hasPlus) {
    formattedNumber = formatNumber(
      number,
      countryCode,
      finalType,
    );
  } else {
    formattedNumber = number;
  }
=======
  const formattedNumber = formatNumber(
    withAreaCode,
    country || countryCode,
    finalType,
  );
>>>>>>> sync from upstream (#16)
  return extension && !removeExtension ?
    `${formattedNumber}${extensionDelimeter}${extension}` :
    formattedNumber;
}
