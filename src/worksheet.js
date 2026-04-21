import { SpellingExercise } from "./spelling_exercise";

export class Worksheet {
  constructor(container) {
    this.container = container;
    this.exercises = [];
    this.currentExerciseIdx = 0;

    for (let i = 0; i < 3; i++) {
      this.exercises.push(new SpellingExercise(container));
    }

    this.exercises[this.currentExerciseIdx].start();
  }
}
