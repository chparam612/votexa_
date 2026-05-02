import { PriorityQueue } from '../PriorityQueue';

describe('PriorityQueue Comprehensive Suite', () => {
  let pq: PriorityQueue<string>;

  beforeEach(() => {
    pq = new PriorityQueue<string>();
  });

  describe('Core Functionality', () => {
    it('should maintain min-priority order with multiple items', () => {
      pq.insert({ id: 'p3', priority: 3, payload: 'three' });
      pq.insert({ id: 'p1', priority: 1, payload: 'one' });
      pq.insert({ id: 'p2', priority: 2, payload: 'two' });

      expect(pq.extractMin()?.id).toBe('p1');
      expect(pq.extractMin()?.id).toBe('p2');
      expect(pq.extractMin()?.id).toBe('p3');
    });

    it('should handle identical priorities (FIFO or arbitrary but consistent)', () => {
      pq.insert({ id: 'p1_a', priority: 1, payload: 'a' });
      pq.insert({ id: 'p1_b', priority: 1, payload: 'b' });
      
      const first = pq.extractMin();
      const second = pq.extractMin();
      
      expect(first?.priority).toBe(1);
      expect(second?.priority).toBe(1);
      expect(pq.size()).toBe(0);
    });

    it('should peek at the minimum item without removal', () => {
      pq.insert({ id: 'p10', priority: 10, payload: 'ten' });
      pq.insert({ id: 'p5', priority: 5, payload: 'five' });
      
      expect(pq.peek()?.id).toBe('p5');
      expect(pq.size()).toBe(2);
      expect(pq.peek()?.id).toBe('p5');
    });
  });

  describe('Heap Property and Performance', () => {
    it('should handle items inserted in reverse order', () => {
      for (let i = 10; i >= 1; i--) {
        pq.insert({ id: `p${i}`, priority: i, payload: `${i}` });
      }
      expect(pq.size()).toBe(10);
      expect(pq.peek()?.priority).toBe(1);
      
      for (let i = 1; i <= 10; i++) {
        expect(pq.extractMin()?.priority).toBe(i);
      }
    });

    it('should handle large volume of items (100+)', () => {
      const count = 100;
      const items = Array.from({ length: count }, (_, i) => ({
        id: `${i}`,
        priority: Math.random() * 1000,
        payload: `${i}`
      }));

      items.forEach(item => pq.insert(item));
      expect(pq.size()).toBe(count);

      let prevPriority = -1;
      while (pq.size() > 0) {
        const current = pq.extractMin()!;
        expect(current.priority).toBeGreaterThanOrEqual(prevPriority);
        prevPriority = current.priority;
      }
    });
  });

  describe('Empty and Edge States', () => {
    it('should return null for empty extraction/peek', () => {
      expect(pq.extractMin()).toBeNull();
      expect(pq.peek()).toBeNull();
    });

    it('should handle single item correctly', () => {
      pq.insert({ id: 'alone', priority: 0, payload: 'zero' });
      expect(pq.size()).toBe(1);
      expect(pq.extractMin()?.id).toBe('alone');
      expect(pq.size()).toBe(0);
    });

    it('should handle negative priorities', () => {
      pq.insert({ id: 'pos', priority: 10, payload: '+' });
      pq.insert({ id: 'neg', priority: -10, payload: '-' });
      expect(pq.peek()?.id).toBe('neg');
    });
  });

  describe('Heap Structure Verification', () => {
    it('should maintain integrity through interleaved insert/extract', () => {
      pq.insert({ id: '5', priority: 5, payload: '5' });
      pq.insert({ id: '10', priority: 10, payload: '10' });
      expect(pq.extractMin()?.id).toBe('5');
      
      pq.insert({ id: '1', priority: 1, payload: '1' });
      pq.insert({ id: '7', priority: 7, payload: '7' });
      
      expect(pq.extractMin()?.id).toBe('1');
      expect(pq.extractMin()?.id).toBe('7');
      expect(pq.extractMin()?.id).toBe('10');
    });
  });
});
