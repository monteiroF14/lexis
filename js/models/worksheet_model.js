export default class WorksheetModel {
  constructor(exercises, worksheetId, sessionModel) {
    this.exercises = exercises;
    this.currentIndex = 0;
    this.correctAnswers = 0;
    this.totalAnswers = 0;
    this.worksheetId = worksheetId;
    this.sessionModel = sessionModel;
  }

  getCurrentExercise() {
    return this.exercises[this.currentIndex];
  }

  nextExercise() {
    if (!this.isCompleted()) this.currentIndex++;
    return this.getCurrentExercise();
  }

  isCompleted() {
    return this.currentIndex >= this.exercises.length;
  }

  recordAnswer(isCorrect) {
    this.totalAnswers++;
    if (isCorrect) this.correctAnswers++;
    if (this.totalAnswers >= this.exercises.length) {
      this._persistProgress();
    }
  }

  getScore() {
    return { correct: this.correctAnswers, total: this.totalAnswers };
  }

  _dispatchStreak() {
    const streakResult = this.sessionModel?.recordDailyActivity();
    if (streakResult) {
      document.body.dispatchEvent(
        new CustomEvent("streak:updated", { detail: streakResult }),
      );
    }
  }

  _persistProgress() {
    const user = this.sessionModel.getSession();
    if (!user) return;

    if (
      !user.solvedSheets.includes(this.worksheetId) &&
      this.correctAnswers / this.totalAnswers >= 0.5
    ) {
      user.solvedSheets.push(this.worksheetId);
    }

    const xpEarned = this.correctAnswers * 10;
    user.xp += xpEarned;

    const newLevel = Math.floor(user.xp / 200) + 1;
    if (newLevel !== user.level) {
      const oldTitle = user.currentTitle;
      user.level = newLevel;
      const titles = [
        "",
        "Explorer",
        "Adventurer",
        "Scholar",
        "Wizard",
        "Master",
        "Legend",
      ];
      user.currentTitle =
        titles[Math.min(newLevel, titles.length - 1)] || "Legend";
      if (user.currentTitle !== oldTitle) {
        document.body.dispatchEvent(
          new CustomEvent("level:up", {
            detail: { level: newLevel, title: user.currentTitle, xp: user.xp },
          }),
        );
      }
    }

    this.sessionModel?.updateUser(user);

    this._dispatchStreak();
  }
}
