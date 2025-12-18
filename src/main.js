import Vue from 'vue';
import WidgetRoot from './components/WidgetRoot.vue';
import UserMsg from './components/UserMsg.vue'; // 1. Import UserMsg

const CSS_FILE_NAME = 'afikasafe-widget.css';

function loadCssText(filename) {
    const scriptTag = document.querySelector('script[src*="afikasafe-widget.js"], script[src*="afikasafe-widget.umd.js"]');
    let cssUrl = filename;

    if (scriptTag && scriptTag.src) {
        cssUrl = scriptTag.src.replace(/\/[^/]*$/, `/${filename}`);
    } else {
        cssUrl = `./dist/${filename}`;
    }

    return fetch(cssUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .catch(error => {
            console.error('[Afikasafe Widget] CSS loading failed:', error.message);
            return null;
        });
}

async function mountWidget(hostElementId, config) {
    const hostElement = document.getElementById(hostElementId);
    const isDev = process.env.NODE_ENV === 'development';

    // MOUNT GLOBAL USER MESSAGE (Outside Shadow DOM)
    // This ensures position: fixed works relative to the whole screen
    if (!document.getElementById('afikasafe-msg-root')) {
        const msgContainer = document.createElement('div');
        msgContainer.id = 'afikasafe-msg-root';
        document.body.appendChild(msgContainer);

        new Vue({
            render: h => h(UserMsg)
        }).$mount(msgContainer);
    }

    // MOUNT WIDGET (Inside Shadow DOM)
    const shadowRoot = hostElement.attachShadow({ mode: isDev ? 'open' : 'closed' });

    if (!isDev) {
        const cssText = await loadCssText(CSS_FILE_NAME);
        if (cssText) {
            const styleEl = document.createElement('style');
            styleEl.textContent = cssText;
            shadowRoot.appendChild(styleEl);
        }
    }

    const mountPoint = document.createElement('div');
    mountPoint.className = 'afikasafe-mount-root';
    shadowRoot.appendChild(mountPoint);

    const app = new Vue({
        render: h => h(WidgetRoot, { props: { config: config } })
    });

    app.$mount(mountPoint);
}

window.afikasafeWidget = {
    init: function (config = {}) {
        const hostElementId = config.mountId || 'afikasafe-widget-mount';
        mountWidget(hostElementId, config);
    }
};