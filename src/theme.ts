export type Colors = {
    bg: string;
    text: string;
    accent: string;
    muted: string;
    surface: string;
    border: string;
    navBg: string;
    chipBg: string;
    surfaceAlt: string;
    sectionBg: string;
};

export const darkColors: Colors = {
    bg: "#040814",
    text: "#f0ece3",
    accent: "#00b5d8",
    muted: "rgba(240,236,227,0.5)",
    surface: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.10)",
    navBg: "rgba(4,8,20,0.82)",
    chipBg: "rgba(0,181,216,0.12)",
    surfaceAlt: "rgba(255,255,255,0.03)",
    sectionBg: "rgba(4,8,20,0.80)",
};

export const lightColors: Colors = {
    bg: "#f5f2ed",
    text: "#0f0d0a",
    accent: "#00768f",
    muted: "rgba(15,13,10,0.5)",
    surface: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.1)",
    navBg: "rgba(245,242,237,0.88)",
    chipBg: "rgba(0,118,143,0.12)",
    surfaceAlt: "rgba(0,0,0,0.025)",
    sectionBg: "rgba(245,242,237,0.90)",
};

export const mono = "'IBM Plex Mono', monospace";
export const serif = "'Inter', sans-serif";
export const heading = "'Space Grotesk', sans-serif";
