export function renderNavbar() {
  const navbarHtml = `
    <nav
      class="navbar navbar-expand-lg bg-body-tertiary shadow-sm py-3 transition-colors"
    >
      <div class="container">
        <a class="navbar-brand fw-bold fs-3 text-primary" href="#">
          <i class="fa-solid fa-puzzle-piece text-warning"></i> Lexis
        </a>

        <div class="d-flex align-items-center gap-3">
          <div class="status-badge text-warning" title="Moedas para o Avatar">
            <i class="fa-solid fa-coins"></i> <span id="coin-count">150</span>
          </div>
          <div class="status-badge text-info" title="Pontos de Experiência">
            <i class="fa-solid fa-star"></i> <span id="xp-count">1200</span> XP
          </div>
          <div class="ms-2">
            <img
              id="avatar"
              alt="O teu Avatar"
              class="rounded-circle bg-body border border-2 border-primary"
              width="50"
              height="50"
              style="cursor: pointer"
            />
          </div>
        </div>
      </div>
    </nav>`;

  const body = document.body.innerHTML;
  document.body.innerHTML = navbarHtml + body;
}

renderNavbar();
