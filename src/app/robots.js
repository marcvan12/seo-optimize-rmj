export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/chats/',
    },
    sitemap: 'https://acme.com/sitemap.xml',
  }
}