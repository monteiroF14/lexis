export class AdminView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    document.querySelectorAll('[data-tab="admin"]').forEach(btn => {
      btn.onclick = () => this.render();
    });
  }

  render() {
    if (window.setActiveTab) window.setActiveTab("admin");
    const users = this.sessionModel.getAllUsers().filter(u => !u.isAnonymous);
    const mc = document.querySelector("#main-container");

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">
          User Management
        </div>
        <div class="table-responsive lexis-contained w-100">
          <table class="table table-sm lexis-text-p">
            <thead>
              <tr>
                <th>Name</th>
                <th>Lv</th>
                <th>Title</th>
                <th>XP</th>
                <th>Coins</th>
                <th>Streak</th>
                <th>Sheets</th>
                <th>HC Best</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `<tr>
                <td>${u.name}</td>
                <td>${u.level}</td>
                <td>${u.currentTitle}</td>
                <td>${u.xp}</td>
                <td>${u.coins}</td>
                <td>${u.streak}</td>
                <td>${u.solvedSheets?.length ?? 0}</td>
                <td>${u.hardcoreBest ?? 0}</td>
              </tr>`).join("")}
            </tbody>
          </table>
          ${users.length === 0 ? '<p class="text-center text-secondary py-3">No registered users yet.</p>' : ''}
        </div>
      </div>`;
  }
}
