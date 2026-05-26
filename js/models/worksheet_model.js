export default class WorksheetModel {
  /**
   * @param {Array<Object>} exercises – array of exercise objects. Each object must contain:
   *   {string} type – the exercise type identifier (e.g. 'spelling')
   *   {Object} data – any data needed by the exercise model
   */
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

  /**
   * Record the result of the current exercise.
   * @param {boolean} isCorrect – whether the user answered correctly.
   */
  recordAnswer(isCorrect) {
    this.totalAnswers++;
    if (isCorrect) this.correctAnswers++;
    // If worksheet is finished, persist progress for the user.
    if (this.isCompleted()) {
      this._persistProgress();
    }
  }

  getScore() {
    return { correct: this.correctAnswers, total: this.totalAnswers };
  }

  _persistProgress() {
    const session = this.sessionModel.getSession();
    if (!session) return; // no session – nothing to persist
    const user = session;
    if (!user || user.isAnonymous) return; // anonymous sessions are not persisted

    // add worksheet id to solvedSheets if not already present
    if (!user.solvedSheets.includes(this.worksheetId)) {
      user.solvedSheets.push(this.worksheetId);
    }
    // award XP – 10 per correct answer
    const xpEarned = this.correctAnswers * 10;
    user.xp += xpEarned;

    this.sessionModel?.updateUser(user);
  }
}
