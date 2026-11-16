
const ExtractPdfLinks = async (parser) => {
  const pdfInfo = await parser.getInfo({ parsePageInfo: true });
  const extractedLinks = [];

  for (const page of pdfInfo.pages) {
    for (const link of page.links || []) {
      let parsedUrl;

      try {
        parsedUrl = new URL(link.url);
      } catch {
        continue;
      }

      if (!["https:", "http:", "mailto:"].includes(parsedUrl.protocol)) {
        continue;
      }

      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      const name = typeof link.text === "string" && link.text.trim()
        ? link.text.trim()
        : parsedUrl.hostname || parsedUrl.href;
      const normalizedName = name.toLowerCase();
      let type = "other";
      let projectName = null;

      if (hostname === "github.com") {
        if (pathSegments.length >= 2) {
          type = "github-repository";
          projectName = pathSegments[1].replace(/\.git$/i, "");
        } else if (pathSegments.length === 1) {
          type = "github-profile";
        }
      } else if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
        type = "linkedin";
      } else if (hostname === "leetcode.com" || hostname.endsWith(".leetcode.com")) {
        type = "leetcode";
      } else if (/\bportfolio\b/.test(normalizedName)) {
        type = "portfolio";
      } else if (/\b(?:live|deployed|demo)\b/.test(normalizedName)) {
        type = "deployed-project";
      } else if (
        ["facebook.com", "instagram.com", "threads.net", "tiktok.com", "twitter.com", "x.com"]
          .some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
      ) {
        type = "social";
      }

      extractedLinks.push({
        name,
        url: parsedUrl.href,
        type,
        projectName,
        pageNumber: page.pageNumber,
      });
    }
  }

  return [...new Map(extractedLinks.map((link) => [link.url, link])).values()];
};

export default ExtractPdfLinks;
