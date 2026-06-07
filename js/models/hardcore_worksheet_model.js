/*
 * HardcoreWorksheetModel – infinite random exercises with time limits.
 * Extends the regular WorksheetModel but generates a new random exercise
 * each time after the previous one is completed.
 */
import WorksheetModel from './worksheet_model.js';

const EXERCISE_TYPES = ['spelling', 'letter_dnd', 'missing', 'word_order'];

function randomWord() {
  const words = ['apple', 'banana', 'orange', 'cat', 'dog', 'fish', 'house', 'tree'];
  return words[Math.floor(Math.random() * words.length)];
}

function randomSentence() {
  const sentences = [
    'the quick brown fox jumps',
    'she sells sea shells',
    'hello world program',
    'learning is fun',
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function generateExercise() {
  const type = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
  switch (type) {
    case 'spelling':
      return { type, data: { word: randomWord() } };
    case 'letter_dnd':
      return { type, data: { word: randomWord(), hint: '' } };
    case 'missing':
      return { type, data: { word: randomWord() } };
    case 'word_order':
      return { type, data: { sentence: randomSentence() } };
    default:
      return { type: 'spelling', data: { word: randomWord() } };
  }
}

export default class HardcoreWorksheetModel extends WorksheetModel {
  constructor(sessionModel) {
    // start with a single generated exercise; list will grow as we go
    super([generateExercise()], 'hardcore', sessionModel);
    this.hardcore = true;
  }

  // Override to always push a new random exercise after moving to next
  nextExercise() {
    // record progress of previous already done via super
    const next = generateExercise();
    this.exercises.push(next);
    this.currentIndex++;
    return this.getCurrentExercise();
  }

  // Hardcore mode rewards coins per correct answer (no XP, no leveling)
  _persistProgress() {
    const user = this.sessionModel?.getSession();
    if (!user) return;
    user.coins += 3;
    this.sessionModel.updateUser(user);

    const streakResult = this.sessionModel?.recordDailyActivity();
    if (streakResult) {
      document.body.dispatchEvent(new CustomEvent("streak:updated", { detail: streakResult }));
    }
  }
}
