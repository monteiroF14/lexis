import {
  SpellingExerciseController,
  SpellingExerciseModel,
  SpellingExerciseView,
} from "./spelling_exercise";
export class WorksheetController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

export class WorksheetModel {
  constructor() {
    this.exercises = [];
    this.currentExerciseIdx = 0;
    for (let i = 0; i < 3; i++) {
      this.exercises.push(
        new SpellingExerciseController(
          new SpellingExerciseModel(),
          new SpellingExerciseView(document.getElementById("game-container")),
        ),
      );
    }
    this.exercises[this.currentExerciseIdx].start();
  }
}

export class WorksheetView {
  constructor(container) {
    this.container = container;
  }
}
