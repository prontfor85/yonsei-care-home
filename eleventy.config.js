import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // GitHub Pages 는 /저장소명/ 하위 경로로 서비스된다. 배포 워크플로가 PATH_PREFIX 를
  // 넣어 주면 HtmlBase 플러그인이 출력 HTML의 절대 경로(href/src)를 전부 고쳐 쓴다.
  // 로컬·루트 도메인(Cloudflare Pages 등)에서는 접두사 없이 그대로 동작한다.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/js": "js",
    "src/admin": "admin",
    "src/uploads": "uploads",
    "assets": "assets",
  });

  // 콘텐츠의 date 는 "YYYY-MM-DD"(UTC 자정)로 저장되므로 UTC 기준으로 잘라야 날짜가 밀리지 않는다
  eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateDot", (d) => new Date(d).toISOString().slice(0, 7).replace("-", "."));

  // 어드민에서 입력한 문구의 줄바꿈을 <br> 로 살린다 (HTML 은 이스케이프)
  eleventyConfig.addFilter("nl2br", (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, "<br>"),
  );

  eleventyConfig.addFilter("onlyPinned", (arr) => arr.filter((p) => p.data.pinned));
  eleventyConfig.addFilter("notPinned", (arr) => arr.filter((p) => !p.data.pinned));

  // 홈 "최근 소식": 공지 + 행사를 합쳐 최신 3건
  eleventyConfig.addCollection("recent", (api) => {
    return [...api.getFilteredByTag("notice"), ...api.getFilteredByTag("event")]
      .sort((a, b) => b.date - a.date)
      .slice(0, 3);
  });

  return {
    dir: { input: "src" },
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
