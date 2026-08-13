export function useDebounceFn<Args extends unknown[]>(fn: (...args: Args) => void, delay = 500) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	const debounced = (...args: Args) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			fn(...args);
		}, delay);
	};
	debounced.cancel = () => {
		if (timer) clearTimeout(timer);
		timer = null;
	};
	return debounced;
}
