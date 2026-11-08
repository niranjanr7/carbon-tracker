export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} | CarbonTracker` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | CarbonTracker` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
