import slugify from "slugify";

export function slugifyString(string: string) {
	const slug = string.replace("/", "-");
	return slugify(slug, { replacement: "-", lower: true, trim: true });
}
