import { createCookieSessionStorage } from "remix";

import { Theme, isTheme } from "~/components/ThemeProvider";

const sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-in-production";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme-cookie",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : "dark";
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}

export { getThemeSession };
