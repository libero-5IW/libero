import countries from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(fr);

export const countryList = Object.entries(countries.getNames('fr')).map(
  ([code, name]) => ({
    name,
    code,
  }),
);
