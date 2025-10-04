interface SearchParamsOptions {
	skipNull?: boolean;
	skipEmptyString?: boolean;
	arrayFormat?: "brackets" | "indices" | "repeat" | "comma";
}

export function createSearchParams(
	params?: Record<string, any>,
	options: SearchParamsOptions = {}
): URLSearchParams {
	const {
		skipNull = true,
		skipEmptyString = false,
		arrayFormat = "repeat",
	} = options;

	const searchParams = new URLSearchParams();

	if (!params) return searchParams;

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		if (skipNull && value === null) continue;
		if (skipEmptyString && value === "") continue;

		if (Array.isArray(value)) {
			if (arrayFormat === "comma") {
				searchParams.append(key, value.filter((v) => v != null).join(","));
			} else if (arrayFormat === "brackets") {
				value.forEach((item) => {
					if (item != null) searchParams.append(`${key}[]`, String(item));
				});
			} else {
				// 'repeat' - по умолчанию
				value.forEach((item) => {
					if (item != null) searchParams.append(key, String(item));
				});
			}
		} else if (typeof value === "object" && value !== null) {
			searchParams.append(key, JSON.stringify(value));
		} else {
			searchParams.append(key, String(value));
		}
	}

	return searchParams;
}
