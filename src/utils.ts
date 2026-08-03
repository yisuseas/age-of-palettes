export function objectFromEntries<A extends PropertyKey, B>(entries: [A, B][]) {
	return Object.fromEntries(entries) as Record<A, B>;
}

export function getElementById<E extends HTMLElement>(id: string): E {
	return document.getElementById(id) as E;
}

export function kebab(str: string): string {
	return str.toLowerCase().replaceAll(" ", "-");
}
