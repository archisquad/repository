import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "@archisquad/repository",
  description:
    "Repository Pattern implementation in TypeScript for framework agnostic usage.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting started", link: "/getting-started" },
      { text: "API", link: "/api/" },
    ],

    sidebar: {
      "/api": [
        { text: "Entity", link: "/api/entity" },
        { text: "Observatory", link: "/api/observatory" },
      ],
      "/complex-types": [
        { text: "Methods", link: "/complex-types/methods" },
      ]
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/archisquad/repository" },
    ],
  },
})
