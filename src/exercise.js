export class ExerciseController {
  constructor(model, view) {
    if (this.constructor === ExerciseController) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }
    if (this.start === undefined) {
      throw new Error("start method must be implemented");
    }
    if (this.handleAnswer === undefined) {
      throw new Error("handleAnswer method must be implemented");
    }
    this.model = model;
    this.view = view;
    this.start();
  }
}

export class ExerciseModel {
  constructor() {
    this.currentQuestion = null;

    if (this.constructor === ExerciseModel) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }
    if (this.loadQuestion === undefined) {
      throw new Error("loadQuestion method must be implemented");
    }
    if (this.checkAnswer === undefined) {
      throw new Error("checkAnswer method must be implemented");
    }
  }
}

export class ExerciseView {
  constructor(container) {
    this.container = container;
    if (this.constructor === ExerciseView) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }
    if (this.render === undefined) {
      throw new Error("render method must be implemented");
    }
    if (this.showFeedback === undefined) {
      throw new Error("showFeedback method must be implemented");
    }
    this.container = container;
  }
}
