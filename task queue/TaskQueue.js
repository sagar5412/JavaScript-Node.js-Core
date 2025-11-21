class TaskQueue {
  constructor(options = {}) {
    this.concurency = options.concurency || 2;
    this.queue = [];
    this.running = 0;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      const excuteTask = async () => {
        this.running++;
        try {
          const res = await task();
          resolve(res);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.nextTask();
        }
      };

      if (this.running < this.concurency) {
        excuteTask();
      } else {
        this.queue.push(excuteTask);
      }
    });
  }
  nextTask() {
    if (this.queue.length > 0 && this.running < this.concurency) {
      const task = this.queue.shift();
      task();
    }
  }

  get stats() {
    return {
      running: this.running,
      concurency: this.concurency,
      length: this.queue.length,
    };
  }
}

function createTask(id, t) {
  return async () => {
    console.log(`Task ${id} started (running: ${queue.stats.running})`);
    await new Promise((r) => setTimeout(r, t));
    console.log(`Task ${id} finished`);

    return { id, succes: true };
  };
}

const queue = new TaskQueue({ concurency: 3 });

const promises = Array.from({ length: 15 }, (_, i) => {
  const promise = queue.add(createTask(i + 1, 1000));
  console.log(`Added ${i + 1} Pending: ${queue.stats.length}`);
  return promise;
});

const res = await Promise.all(promises);
console.log(res);
