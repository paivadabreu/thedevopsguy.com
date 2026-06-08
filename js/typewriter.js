class Typewriter {
  constructor({ speed = 28, pause = 480 } = {}) {
    this.speed = speed;
    this.pause = pause;
    this.queue = [];
    this.running = false;
    this.skipRequested = false;
    this.generation = 0;
    this.cursor = document.createElement("span");
    this.cursor.className = "cursor";
    this.cursor.setAttribute("aria-hidden", "true");
  }

  enqueue(task) {
    this.queue.push(task);
    return this;
  }

  reset() {
    this.generation += 1;
    this.queue = [];
    this.running = false;
    this.skipRequested = false;
    this.cursor.remove();
  }

  skip() {
    this.skipRequested = true;
  }

  async run() {
    if (this.running) return;
    this.running = true;
    const generation = this.generation;

    while (this.queue.length && generation === this.generation) {
      const task = this.queue.shift();
      if (task.type === "pause") {
        await this.wait(task.duration ?? this.pause, generation);
      }
      if (task.type === "text") {
        await this.typeText(task.element, task.text, task.speed ?? this.speed, generation);
      }
      if (task.type === "html") {
        task.element.innerHTML = task.html;
      }
      if (task.type === "node") {
        task.parent.appendChild(task.node);
      }
    }

    if (generation === this.generation) {
      this.cursor.remove();
      this.running = false;
      this.skipRequested = false;
    }
  }

  async typeText(element, text, speed, generation) {
    element.textContent = "";
    element.appendChild(this.cursor);

    for (const char of text) {
      if (generation !== this.generation) return;
      if (this.skipRequested) {
        element.textContent = text;
        element.appendChild(this.cursor);
        break;
      }
      this.cursor.before(document.createTextNode(char));
      await this.wait(speed, generation);
    }
  }

  wait(duration, generation = this.generation) {
    if (this.skipRequested) return Promise.resolve();
    if (generation !== this.generation) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}

window.Typewriter = Typewriter;