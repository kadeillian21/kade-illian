/**
 * Progress Queue Utility
 *
 * Handles reliable progress updates with:
 * - Retry logic with exponential backoff
 * - Queue for pending updates
 * - Error notification callbacks
 * - Deduplication of in-flight requests
 */

interface ProgressUpdate {
  wordId: string;
  correct: boolean;
  level: number | undefined;
  nextReview: string | undefined;
  lastReviewed: string | undefined;
  reviewCount: number | undefined;
  correctCount: number | undefined;
  timestamp: number;
}

interface QueueCallbacks {
  onSuccess?: (wordId: string, stats: any) => void;
  onError?: (wordId: string, error: string) => void;
  onRetry?: (wordId: string, attempt: number) => void;
}

class ProgressQueue {
  private queue: Map<string, ProgressUpdate> = new Map();
  private inFlight: Set<string> = new Set();
  private callbacks: QueueCallbacks = {};
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second

  setCallbacks(callbacks: QueueCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Queue a progress update. If an update for this word is already queued,
   * it will be replaced with the newer update.
   */
  async queueUpdate(update: Omit<ProgressUpdate, 'timestamp'>): Promise<void> {
    const fullUpdate: ProgressUpdate = {
      ...update,
      timestamp: Date.now(),
    };

    // If this word is currently being processed, queue for later
    if (this.inFlight.has(update.wordId)) {
      this.queue.set(update.wordId, fullUpdate);
      return;
    }

    // Process immediately
    await this.processUpdate(fullUpdate);
  }

  private async processUpdate(update: ProgressUpdate, attempt = 1): Promise<void> {
    const { wordId } = update;

    // Mark as in-flight
    this.inFlight.add(wordId);

    try {
      const response = await fetch('/api/vocab/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: update.wordId,
          correct: update.correct,
          level: update.level ?? 0,
          nextReview: update.nextReview ?? null,
          lastReviewed: update.lastReviewed ?? null,
          reviewCount: update.reviewCount ?? 0,
          correctCount: update.correctCount ?? 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Success!
      this.inFlight.delete(wordId);
      this.callbacks.onSuccess?.(wordId, data.stats);

      // Check if there's a newer update queued
      const queuedUpdate = this.queue.get(wordId);
      if (queuedUpdate && queuedUpdate.timestamp > update.timestamp) {
        this.queue.delete(wordId);
        await this.processUpdate(queuedUpdate);
      }

    } catch (error) {
      console.error(`Progress update failed for ${wordId} (attempt ${attempt}):`, error);

      if (attempt < this.maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        this.callbacks.onRetry?.(wordId, attempt);

        await new Promise(resolve => setTimeout(resolve, delay));

        // Check if there's a newer update - if so, use that instead
        const queuedUpdate = this.queue.get(wordId);
        if (queuedUpdate && queuedUpdate.timestamp > update.timestamp) {
          this.queue.delete(wordId);
          this.inFlight.delete(wordId);
          await this.processUpdate(queuedUpdate);
        } else {
          await this.processUpdate(update, attempt + 1);
        }
      } else {
        // Final failure
        this.inFlight.delete(wordId);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.callbacks.onError?.(wordId, errorMessage);

        // Keep in queue for potential manual retry
        this.queue.set(wordId, update);
      }
    }
  }

  /**
   * Retry all failed updates
   */
  async retryFailed(): Promise<void> {
    const failedUpdates = Array.from(this.queue.values());
    this.queue.clear();

    for (const update of failedUpdates) {
      if (!this.inFlight.has(update.wordId)) {
        await this.processUpdate(update);
      }
    }
  }

  /**
   * Get count of pending/failed updates
   */
  getPendingCount(): number {
    return this.queue.size;
  }

  /**
   * Check if any updates are currently in flight
   */
  hasInFlight(): boolean {
    return this.inFlight.size > 0;
  }
}

// Singleton instance
export const progressQueue = new ProgressQueue();

/**
 * Hook-friendly wrapper for updating progress with automatic retry
 */
export async function updateProgressReliably(
  update: Omit<ProgressUpdate, 'timestamp'>,
  callbacks?: QueueCallbacks
): Promise<void> {
  if (callbacks) {
    progressQueue.setCallbacks(callbacks);
  }
  await progressQueue.queueUpdate(update);
}
