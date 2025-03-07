import type { App } from 'vue';
import { VueWaterfallNext } from './components/Waterfall';

export const VueWaterfallNextGlobal = {
    install: (app: App) => {
        app.component('VueWaterfallNext', VueWaterfallNext);
    },
};

export * from './components/Waterfall';
export default VueWaterfallNext;
