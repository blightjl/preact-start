/** Joins truthy class names, e.g. `classNames(styles.card, active && styles.active)`. */
export function classNames(...names: Array<string | false | null | undefined>) {
	return names.filter(Boolean).join(' ');
}
