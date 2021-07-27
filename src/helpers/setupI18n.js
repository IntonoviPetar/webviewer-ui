import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import languageRules from '../constants/languageRules';

// https://github.com/isaachinman/next-i18next/issues/562
// the values in this array should match the language codes of the json files inside the i18n folder
i18next.languages = [
  'en',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'nl',
  'pt_br',
  'ru',
  'zh_cn',
  'zh_tw'
];

export default state => {
  const options = {
    fallbackLng: 'en',
    react: {
      useSuspense: false,
      wait: true,
    },
  };
  const callback = (err, t) => {
    window.Annotations.Utilities.setAnnotationSubjectHandler(type =>
      t(`annotation.${type}`),
    );

    window.Core.Tools.SignatureCreateTool.setTextHandler(() =>
      t('message.signHere'),
    );

    window.Core.Tools.FreeTextCreateTool.setTextHandler(() =>
      t('message.insertTextHere'),
    );

    window.Core.Tools.CalloutCreateTool.setTextHandler(() =>
      t('message.insertTextHere'),
    );
  };

  const addQueryString = (url, params) => {
    if (params && typeof params === 'object') {
      let queryString = '';
      // Must encode data
      for (const paramName in params) {
        queryString += '&' + encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName]);
      }
      if (!queryString) {
        return url;
      }
      url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1);
    }
    return url;
  };

  const requestWithXmlHttpRequest = (options, url, payload, callback) => {
    if (payload && typeof payload === 'object') {
      // if (!cache) payload._t = Date.now()
      // URL encoded form payload must be in querystring format
      payload = addQueryString('', payload).slice(1);
    }
  
    try {
      let x;
      x = new XMLHttpRequest();
      x.open('GET', url, 1);
      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      x.withCredentials = !!options.withCredentials;
      if (payload) {
        x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      if (x.overrideMimeType) {
        x.overrideMimeType('application/json');
      }
      let h = options.customHeaders;
      h = typeof h === 'function' ? h() : h;
      if (h) {
        for (var i in h) {
          x.setRequestHeader(i, h[i]);
        }
      }
      x.onreadystatechange = () => {
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, { status: x.status || 200, data: x.responseText }); // in android webview loading a file is status status 0
      };
      x.send(payload);
    } catch (e) {
      console && console.log(e);
    }
  };

  if (state.advanced.disableI18n) {
    i18next.init(options, callback);
  } else {
    i18next.use(HttpApi).init(
      {
        ...options,
        backend: {
          loadPath: './i18n/{{ns}}-{{lng}}.json',
          request: requestWithXmlHttpRequest
        },
      },
      callback,
    );
  }

  // set custom rules. since i18next doesn't support (i.e 'zh-ch', 'zh-tw', or 'pt-br')
  // have to look inside the i18n source code "getRule" function to see what rule we can copy
  Object.keys(languageRules).forEach(lang => {
    if (languageRules[lang].i18next) {
      const rule = i18next.services.pluralResolver.getRule(languageRules[lang].i18next);
      i18next.services.pluralResolver.addRule(lang, rule);
    }
  });
};
