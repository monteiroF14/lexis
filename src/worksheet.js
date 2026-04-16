class WorksheetController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

class WorksheetModel {
  constructor() {
    this.exercises = [];
    for (let i = 0; i < 3; i++) {
      this.exercises.push(
        new SpellingExerciseController(
          new SpellingExerciseModel(),
          new SpellingExerciseView(),
        ),
      );
    }
  }
}

class WorksheetView {
  constructor(container) {
    this.container = container;
  }
}
