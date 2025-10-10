import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chatty-theme") || "night",
    setTheme: (theme) => {
        localStorage.setItem("chatty-theme", theme);
        set({theme});
    },
}));