import {
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { MetaFunction } from "remix";
import clsx from "clsx";
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "~/components/ThemeProvider";

import openGraphImage from "~/assets/images/opengraph.png";

export const meta: MetaFunction = ({ data, location }) => {
  const lang = (data as LoaderData)?.lang || "en";
  const seo = seoByLang[lang] || seoByLang["en"];
  return {
    title: seo.title,
    viewport: "width=device-width,initial-scale=1",
    description: seo.description,
    "og:image": `https://jsonhero.io${openGraphImage}`,
    "og:url": `https://jsonhero.io${location.pathname}`,
    "og:title": seo.title,
    "og:description": seo.description,
    "twitter:image": `https://jsonhero.io${openGraphImage}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@json_hero",
    "twitter:site": "@json_hero",
    "twitter:title": seo.title,
    "twitter:description": seo.description,
  };
};

const seoByLang: Record<string, { title: string; description: string }> = {
  en: {
    title: "JSON Hero - a beautiful JSON viewer for the web",
    description:
      "View, search, and explore your JSON data with an intuitive column-based interface. JSON Hero makes reading JSON files easy with a clean and beautiful UI.",
  },
  zh: {
    title: "JSON Hero - 优雅的 JSON 查看器",
    description:
      "通过格式化的列式界面查看、搜索和浏览 JSON 数据。JSON Hero 以简洁优雅的界面让 JSON 文件的阅读变得轻松。",
  },
  ja: {
    title: "JSON Hero - 美しい JSON ビューアー",
    description:
      "直感的なカラムベースのインターフェースで JSON データを表示・検索・探索。JSON Hero はクリーンで美しい UI で JSON ファイルの読み取りを簡単にします。",
  },
  fr: {
    title: "JSON Hero - un magnifique visualiseur JSON",
    description:
      "Visualisez, recherchez et explorez vos données JSON avec une interface intuitive basée sur des colonnes. JSON Hero rend la lecture des fichiers JSON facile.",
  },
  de: {
    title: "JSON Hero - ein schöner JSON-Viewer für das Web",
    description:
      "Betrachten, durchsuchen und erkunden Sie Ihre JSON-Daten mit einer intuitiven spaltenbasierten Oberfläche. JSON Hero macht das Lesen von JSON-Dateien einfach.",
  },
  es: {
    title: "JSON Hero - un hermoso visor de JSON",
    description:
      "Vea, busque y explore sus datos JSON con una interfaz intuitiva basada en columnas. JSON Hero facilita la lectura de archivos JSON.",
  },
  ko: {
    title: "JSON Hero - 아름다운 JSON 뷰어",
    description:
      "직관적인 컬럼 기반 인터페이스로 JSON 데이터를 보고, 검색하고, 탐색하세요. JSON Hero는 깔끔하고 아름다운 UI로 JSON 파일 읽기를 쉽게 만듭니다.",
  },
  id: {
    title: "JSON Hero - penampil JSON yang indah",
    description:
      "Lihat, cari, dan jelajahi data JSON Anda dengan antarmuka berbasis kolom yang intuitif. JSON Hero membuat membaca file JSON menjadi mudah.",
  },
  pt: {
    title: "JSON Hero - um belo visualizador de JSON",
    description:
      "Veja, pesquise e explore seus dados JSON com uma interface intuitiva baseada em colunas. JSON Hero torna a leitura de arquivos JSON fácil.",
  },
};

import styles from "./tailwind.css";
import { getThemeSession } from "./theme.server";
import "./i18n/i18n";
import i18n from "./i18n/i18n";
import { I18nextProvider } from "react-i18next";
import { getStarCount } from "./services/github.server";
import { StarCountProvider } from "./components/StarCountProvider";
import { PreferencesProvider } from "~/components/PreferencesProvider";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export type LoaderData = {
  theme?: Theme;
  starCount?: number;
  themeOverride?: Theme;
  lang?: string;
};

const SUPPORTED_LOCALES = ["en", "zh", "ja", "ko", "id", "es", "de", "pt", "fr"];

function detectLang(request: Request): string {
  const acceptLang = request.headers.get("Accept-Language");
  if (!acceptLang) return "en";
  // Parse "zh-CN,zh;q=0.9,en;q=0.8" → pick first supported locale
  const langs = acceptLang.split(",").map((s) => s.split(";")[0].trim());
  for (const l of langs) {
    const base = l.split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return "en";
}

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const starCount = await getStarCount();
  const themeOverride = getThemeFromRequest(request);
  const lang = detectLang(request);

  const data: LoaderData = {
    theme: themeSession.getTheme(),
    starCount,
    themeOverride,
    lang,
  };

  return data;
};

function getThemeFromRequest(request: Request): Theme | undefined {
  const url = new URL(request.url);
  const theme = url.searchParams.get("theme");
  if (theme) {
    return theme as Theme;
  }
  return undefined;
}

function App({ lang }: { lang?: string }) {
  const [theme] = useTheme();

  return (
    <html lang={lang || "en"} className={clsx(theme)}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(theme)} />
      </head>
      <body className="overscroll-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const { theme, starCount, themeOverride, lang } = useLoaderData<LoaderData>();

  return (
    <ThemeProvider
      specifiedTheme={theme}
      themeOverride={themeOverride}
    >
      <I18nextProvider i18n={i18n}>
        <PreferencesProvider>
          <StarCountProvider starCount={starCount}>
            <App lang={lang} />
          </StarCountProvider>
        </PreferencesProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
