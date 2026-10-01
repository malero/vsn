const menus = document.querySelectorAll('.mobile-navigation select');

function restoreSelection() {
  // Browsers can restore the last chosen form value when revisiting a page.
  // The server-rendered value always represents this page, including BFCache.
  for (const menu of menus) menu.value = menu.dataset.current;
}

restoreSelection();
window.addEventListener('pageshow', restoreSelection);

for (const menu of menus) {
  menu.addEventListener('change', () => {
    if (menu.value && menu.value !== menu.dataset.current) {
      window.location.assign(menu.value);
    }
  });
}
