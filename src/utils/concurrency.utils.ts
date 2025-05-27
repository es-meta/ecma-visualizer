import PQueue from "p-queue";

type Task<T> = Parameters<typeof PQueue.prototype.add<T>>[0];

export async function enqueue(concurrency: number, tasks: Array<Task<void>>) {
  const queue = new PQueue({ concurrency });

  for (const task of tasks) {
    queue.add(task);
  }

  return await queue.onIdle();
}
