import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";
import colors from "tailwindcss/colors";

const baseColors = [
  "gray",
  "red",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];

const shadeMapping = {
  "50": "900",
  "100": "800",
  "200": "700",
  "300": "600",
  "400": "500",
  "500": "400",
  "600": "300",
  "700": "200",
  "800": "100",
  "900": "50",
};

const generateThemeObject = (colors: any, mapping: any, invert = false) => {
  const theme: any = {};
  baseColors.forEach((color) => {
    theme[color] = {};
    Object.entries(mapping).forEach(([key, value]: any) => {
      const shadeKey = invert ? value : key;
      theme[color][key] = colors[color][shadeKey];
    });
  });
  return theme;
};

const lightTheme = {
  ...generateThemeObject(colors, shadeMapping),
  white: "#ffffff",
  black: colors.black,
  primary: colors.indigo["500"],
  secondary: colors.blue["500"],
  accent: colors.purple["500"],
  text: colors.gray["800"],
  background: colors.gray["100"],
  surface: colors.white,
  muted: colors.gray["600"],
  border: colors.gray["300"],
};

const darkTheme = {
  gray: {
    50: colors.gray["900"],
    100: colors.gray["800"],
    200: colors.gray["700"],
    300: colors.gray["600"],
    400: colors.gray["500"],
    500: colors.gray["400"],
    600: colors.gray["300"],
    700: colors.gray["200"],
    800: colors.gray["100"],
    900: colors.gray["50"],
  },
  red: generateThemeObject(colors, shadeMapping, true).red,
  yellow: generateThemeObject(colors, shadeMapping, true).yellow,
  green: generateThemeObject(colors, shadeMapping, true).green,
  blue: generateThemeObject(colors, shadeMapping, true).blue,
  indigo: { 
    50: colors.indigo["950"],
    100: colors.indigo["800"],
    200: colors.indigo["700"],
    300: colors.indigo["600"],
    400: colors.indigo["500"],
    500: colors.indigo["100"],
    600: colors.indigo["300"],
    700: colors.indigo["200"],
    800: colors.indigo["100"],
    900: colors.indigo["50"],
  },
  purple: generateThemeObject(colors, shadeMapping, true).purple,
  pink: generateThemeObject(colors, shadeMapping, true).pink,
  white: colors.gray["900"], 
  black: colors.gray["50"],
  primary: colors.indigo["400"], 
  secondary: colors.blue["400"],
  accent: colors.purple["400"],
  text: colors.gray["300"], 
  background: colors.gray["900"], 
  surface: colors.gray["800"],
  muted: colors.gray["500"],
  border: colors.gray["700"],
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        'top-bottom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
    colors: {
      gray: colors.gray,
      red: colors.red,
      yellow: colors.yellow,
      green: colors.green,
      blue: colors.blue,
      indigo: colors.indigo,
      purple: colors.purple,
      pink: colors.pink,
      white: colors.white,
      black: colors.black,
    }
  },
  plugins: [createThemes(themes), require('@tailwindcss/typography')],
};

export default config;