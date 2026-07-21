import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Дом на Южной",
    short_name: "Дом на Южной",
    description: "Аренда дома с террасой и купелью Фурако в Борисове.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1310",
    theme_color: "#0b1310",
    lang: "ru",
    icons: [
      {
        src: "/assets/app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/assets/app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
