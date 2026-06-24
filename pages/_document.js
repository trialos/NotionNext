// eslint-disable-next-line @next/next/no-document-import-in-page
import BLOG from '@/blog.config'
import Document, { Head, Html, Main, NextScript } from 'next/document'

const fontAwesomeLoadScript = BLOG.FONT_AWESOME
  ? `
(function() {
  var href = '${BLOG.FONT_AWESOME}';
  var storageKey = 'notionnext-font-awesome-loaded';
  var loaded = false;

  var load = function() {
    if (loaded || document.getElementById('font-awesome-css')) return;
    loaded = true;
    var link = document.createElement('link');
    link.id = 'font-awesome-css';
    link.rel = 'stylesheet';
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    link.onload = function() {
      try { localStorage.setItem(storageKey, '1'); } catch (e) {}
      document.documentElement.classList.add('fontawesome-ready');
    };
    document.head.appendChild(link);
  };

  try {
    if (localStorage.getItem(storageKey) === '1') {
      setTimeout(load, 0);
      return;
    }
  } catch (e) {}

  var intentEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  var onIntent = function() {
    clearIntentEvents();
    load();
  };
  var clearIntentEvents = function() {
    intentEvents.forEach(function(eventName) {
      window.removeEventListener(eventName, onIntent);
    });
  };

  intentEvents.forEach(function(eventName) {
    window.addEventListener(eventName, onIntent, { once: true, passive: true });
  });

  window.addEventListener('load', function() {
    setTimeout(function() {
      clearIntentEvents();
      load();
    }, 8000);
  }, { once: true });
})()
`
  : ''

// 预先设置深色模式的脚本内容
const darkModeScript = `
(function() {
  const darkMode = localStorage.getItem('darkMode')

  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  const defaultAppearance = '${BLOG.APPEARANCE || 'auto'}'

  let shouldBeDark = darkMode === 'true' || darkMode === 'dark'

  if (darkMode === null) {
    if (defaultAppearance === 'dark') {
      shouldBeDark = true
    } else if (defaultAppearance === 'auto') {
      // 检查是否在深色模式时间范围内
      const date = new Date()
      const hours = date.getHours()
      const darkTimeStart = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[0] : 18}
      const darkTimeEnd = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[1] : 6}
      
      shouldBeDark = prefersDark || (hours >= darkTimeStart || hours < darkTimeEnd)
    }
  }
  
  // 立即设置 html 元素的类
  document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light')
})()
`

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang={BLOG.LANG}>
        <Head>
          <link rel='preconnect' href='https://images.unsplash.com' />
          <link rel='dns-prefetch' href='//images.unsplash.com' />

          {/* 预加载字体 */}
          {BLOG.FONT_AWESOME && (
            <>
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    '.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{display:inline-flex;width:1.25em;min-width:1.25em;height:1em;align-items:center;justify-content:center;text-align:center;line-height:1;visibility:hidden}.fontawesome-ready .fa,.fontawesome-ready .fas,.fontawesome-ready .far,.fontawesome-ready .fab,.fontawesome-ready .fa-solid,.fontawesome-ready .fa-regular,.fontawesome-ready .fa-brands{visibility:visible}'
                }}
              />
              <script
                dangerouslySetInnerHTML={{ __html: fontAwesomeLoadScript }}
              />
              <noscript>
                <link
                  rel='stylesheet'
                  href={BLOG.FONT_AWESOME}
                  crossOrigin='anonymous'
                  referrerPolicy='no-referrer'
                />
              </noscript>
            </>
          )}

          {/* 预先设置深色模式，避免闪烁 */}
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
