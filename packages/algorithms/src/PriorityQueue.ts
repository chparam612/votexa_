export interface QueueItem {
  id: string;
  priority: number;
  payload: any;
}

export class PriorityQueue {
  private heap: QueueItem[] = [];

  private getParentIndex(i: number) { return Math.floor((i - 1) / 2); }
  private getLeftChildIndex(i: number) { return 2 * i + 1; }
  private getRightChildIndex(i: number) { return 2 * i + 2; }

  private swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  public insert(item: QueueItem) {
    this.heap.push(item);
    let index = this.heap.length - 1;

    while (index > 0 && this.heap[this.getParentIndex(index)].priority > this.heap[index].priority) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  public extractMin(): QueueItem | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapify(0);

    return min;
  }

  private heapify(index: number) {
    let smallest = index;
    const left = this.getLeftChildIndex(index);
    const right = this.getRightChildIndex(index);

    if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
      smallest = left;
    }
    if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapify(smallest);
    }
  }

  public peek(): QueueItem | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public size(): number {
    return this.heap.length;
  }
}
