
/** Tracks comparison counts for benchmarking sort performance. */
interface SortStats {
    comparisons: number;
}

const INSERTION_SORT_THRESHOLD = 10;

/**
 * Sorts an array of numbers in ascending order using quicksort, with an
 * insertion sort fallback for small partitions.
 *
 * Time complexity: O(n log n) average case, O(n^2) worst case (rare, due to
 * the smaller-partition recursion bound); O(n^2) degrades to O(n) for nearly
 * sorted small partitions handled by insertion sort.
 * Space complexity: O(n) for the returned copy, plus O(log n) recursion stack.
 *
 * @param numbers - The numbers to sort. Must all be finite (no NaN or Infinity).
 * @param stats - Optional counter object that accumulates comparisons made during the sort, for benchmarking.
 * @returns A new array containing the same numbers in ascending order.
 * @throws {TypeError} If `numbers` contains NaN or Infinity.
 * @example
 * const stats = { comparisons: 0 };
 * smartSort([5, 3, 8, 1], stats); // [1, 3, 5, 8]
 * console.log(stats.comparisons);
 */
function smartSort(numbers: number[], stats?: SortStats): number[] {
    if (numbers.some(n => !Number.isFinite(n))) {
        throw new TypeError('smartSort only accepts finite numbers (no NaN or Infinity).');
    }

    const result = numbers.slice();
    quicksort(result, 0, result.length - 1, stats);
    return result;
}

/**
 * Sorts `arr[low..high]` in place using quicksort, falling back to insertion
 * sort for partitions smaller than {@link INSERTION_SORT_THRESHOLD}.
 *
 * Time complexity: O(n log n) average, O(n^2) worst case.
 * Space complexity: O(1) auxiliary (in-place); O(log n) recursion stack.
 *
 * @param arr - The array to sort in place.
 * @param low - Start index (inclusive) of the range to sort.
 * @param high - End index (inclusive) of the range to sort.
 * @param stats - Optional counter object incremented for each comparison made.
 * @example
 * const arr = [5, 3, 8, 1];
 * quicksort(arr, 0, arr.length - 1); // arr is now [1, 3, 5, 8]
 */
function quicksort(arr: number[], low: number, high: number, stats?: SortStats): void {
    while (low < high) {
        if (high - low + 1 < INSERTION_SORT_THRESHOLD) {
            insertionSort(arr, low, high, stats);
            return;
        }

        const pivotIndex = partition(arr, low, high, stats);

        // Recurse into the smaller side and loop over the larger one to keep stack depth at O(log n).
        if (pivotIndex - low < high - pivotIndex) {
            quicksort(arr, low, pivotIndex - 1, stats);
            low = pivotIndex + 1;
        } else {
            quicksort(arr, pivotIndex + 1, high, stats);
            high = pivotIndex - 1;
        }
    }
}

/**
 * Partitions `arr[low..high]` around the pivot (last element) using the
 * Lomuto scheme, placing smaller elements before it.
 *
 * Time complexity: O(n) where n = high - low + 1.
 * Space complexity: O(1) auxiliary.
 *
 * @param arr - The array to partition in place.
 * @param low - Start index (inclusive) of the range to partition.
 * @param high - End index (inclusive) of the range to partition; also the pivot index.
 * @param stats - Optional counter object incremented for each comparison made.
 * @returns The final index of the pivot after partitioning.
 * @example
 * const arr = [5, 3, 8, 1];
 * const pivotIndex = partition(arr, 0, arr.length - 1);
 */
function partition(arr: number[], low: number, high: number, stats?: SortStats): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (stats) {
            stats.comparisons++;
        }

        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

/**
 * Sorts `arr[low..high]` in place using insertion sort. Efficient for the
 * small partitions quicksort delegates to.
 *
 * Time complexity: O(n^2) worst case, O(n) best case (already sorted).
 * Space complexity: O(1) auxiliary.
 *
 * @param arr - The array to sort in place.
 * @param low - Start index (inclusive) of the range to sort.
 * @param high - End index (inclusive) of the range to sort.
 * @param stats - Optional counter object incremented for each comparison made.
 * @example
 * const arr = [5, 3, 8, 1];
 * insertionSort(arr, 0, arr.length - 1); // arr is now [1, 3, 5, 8]
 */
function insertionSort(arr: number[], low: number, high: number, stats?: SortStats): void {
    for (let i = low + 1; i <= high; i++) {
        const current = arr[i];
        let j = i - 1;

        while (j >= low) {
            if (stats) {
                stats.comparisons++;
            }

            if (arr[j] <= current) {
                break;
            }

            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = current;
    }
}