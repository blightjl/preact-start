import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Placeholder values carried over from Gatsby ("blightjl", "N/A") become
// undefined, so pages never render a broken link.
const optionalUrl = z
	.string()
	.optional()
	.transform((value) => (value && /^https?:\/\//.test(value) ? value : undefined));

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		year: z.number().int(),
		technologies: z.array(z.string()),
		link: optionalUrl,
	}),
});

const certificates = defineCollection({
	loader: glob({ base: './src/content/certificates', pattern: '**/*.md' }),
	schema: z.object({
		issuer: z.string(),
		// Kept as display strings: the source mixes MM/DD/YYYY, MM/DD/YY and "N/A".
		dateAcquired: z.string(),
		expirationDate: z.string(),
		link: optionalUrl,
	}),
});

export const collections = { projects, certificates };
