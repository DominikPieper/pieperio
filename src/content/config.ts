import { defineCollection, reference, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        intro: z.string(),
        tags: z.array(z.string()),
        image: image().optional(),
        author: reference('author'),
        pubDate: z.date()
    }),
});

const notesCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        tags: z.array(z.string()),
        pubDate: z.date()
    }),
});

const pageCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        intro: z.string(),
        image: image().optional()
    }),
});

const authorCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        displayName: z.string(),
        bio: z.string().optional(),
        photo: image().optional()
    }),
});

export const collections = {
    'blog': blogCollection,
    'notes': notesCollection,
    'author': authorCollection,
    'page': pageCollection,
};