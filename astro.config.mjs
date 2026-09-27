// @ts-check

import preact from '@astrojs/preact';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Add `site: 'https://<your-domain>'` once the real domain is known — the
	// Gatsby siteUrl was still a placeholder (see astro-port/extracted/REPORT.md).
	integrations: [preact()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Italiana',
			cssVariable: '--font-italiana',
			fallbacks: ['serif'],
			weights: [400],
			styles: ['normal'],
		},
	],
});
