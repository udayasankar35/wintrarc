import { THEME_COLORS, THEME_STORAGE_KEY } from "./theme";

/*
 * Runs in <head> before first paint so the page never flashes the wrong
 * theme. It must stay plain ES5 and must never throw: storage can be blocked
 * (private windows) and matchMedia can be missing. Any failure falls back to
 * dark, the default. theme.test.ts runs this against the same cases as
 * resolveTheme so the two cannot drift apart.
 */
export const themeInitScript = `(function(){var d=document.documentElement;try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)},c=${JSON.stringify(
  THEME_COLORS,
)},p=null;try{p=localStorage.getItem(k)}catch(e){}if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var l=false;try{l=window.matchMedia("(prefers-color-scheme: light)").matches}catch(e){}var t=p==="light"||(p==="system"&&l)?"light":"dark";d.setAttribute("data-theme",t);d.setAttribute("data-theme-preference",p);d.style.colorScheme=t;var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].setAttribute("content",c[t])}catch(e){d.setAttribute("data-theme","dark")}})();`;
