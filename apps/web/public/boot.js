/* Applies the saved theme and the "Giảm độ trong suốt" preference before first paint.
   Served as a same-origin file (not inline) so the CSP can stay free of 'unsafe-inline' for scripts. */
(function () {
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem("kdigi-theme");
    var dark = theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    if (localStorage.getItem("kdigi-transparency") === "reduced") root.dataset.transparency = "reduced";
  } catch (e) {
    /* storage blocked: the page keeps the system theme */
  }
})();
