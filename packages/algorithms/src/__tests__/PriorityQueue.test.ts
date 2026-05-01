import { PriorityQueue } from '../PriorityQueue';

describe('PriorityQueue', () => {
  it('should extract items in min-priority order', () => {
    const pq = new PriorityQueue();
    pq.insert({ id: 'low', priority: 10, payload: {} });
    pq.insert({ id: 'high', priority: 1, payload: {} });
    pq.insert({ id: 'medium', priority: 5, payload: {} });

    expect(pq.extractMin()?.id).toBe('high');
    expect(pq.extractMin()?.id).toBe('medium');
    expect(pq.extractMin()?.id).toBe('low');
  });

  it('should return null when extracting from empty queue', () => {
    const pq = new PriorityQueue();
    expect(pq.extractMin()).toBeNull();
  });

  it('should correctly report its size', () => {
    const pq = new PriorityQueue();
    expect(pq.size()).toBe(0);
    pq.insert({ id: '1', priority: 1, payload: {} });
    expect(pq.size()).toBe(1);
    pq.extractMin();
    expect(pq.size()).toBe(0);
  });

  it('should peek at the minimum item without removing it', () => {
    const pq = new PriorityQueue();
    pq.insert({ id: '2', priority: 2, payload: {} });
    pq.insert({ id: '1', priority: 1, payload: {} });

    expect(pq.peek()?.id).toBe('1');
    expect(pq.size()).toBe(2);
  });
});
