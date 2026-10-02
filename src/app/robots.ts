import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/student/'],
    },
    sitemap: 'https://auto-ai-academy-website.vercel.app/sitemap.xml',
  };
}
