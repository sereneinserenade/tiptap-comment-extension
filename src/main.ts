import { createApp } from 'vue'
import App from './App.vue'

import { Inkline, components } from '@inkline/inkline';
import '@inkline/inkline/inkline.scss';

import './index.scss'

createApp(App).use(Inkline, {
  components,
  colorMode: 'system',
  locale: 'en',
}).mount('#app')
