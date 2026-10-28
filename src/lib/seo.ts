export const SITE_URL = "https://www.terraformings.co";
export const SITE_NAME = "TERRA FORMING";
const SHARE_IMAGE = "/terra/estado/logo-terraforming.png";

export function absoluteUrl(path: string) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageSeo({
  title,
  description,
  path,
  robots = "index, follow, max-image-preview:large",
}: {
  title: string;
  description: string;
  path: string;
  robots?: string;
}) {
  const url = absoluteUrl(path);
  const image = absoluteUrl(SHARE_IMAGE);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "es_CO" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
