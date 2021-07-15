import i18n from 'i18n-js'
import * as Localization from 'expo-localization'
import { translation, translationKo } from '../locales'

// Set the key-value pairs for the different languages you want to support.

i18n.translations = {
    en: translation,
    ko: translationKo,
}

// Set the locale once at the beginning of your app.
// When a value is missing from a language it'll fallback to another language with the key present.

i18n.fallbacks = true

export const i18nt = (
    scope,
    options,
    locale,
) => {
    const currentLocale = locale ?? Localization.locale.split('-')[0]
    return i18n.t(scope, { locale: currentLocale, ...options })
}

//  resourceTypeKey를 locale하기 위한 func
//  '.'을 '-'로 replace
export const i18ntBy = (resourceTypeKey) => {
    const replaced = resourceTypeKey.replace(/\./g, '-')
    return i18nt(`resourceTypes.${replaced}`)
}

export default i18n
