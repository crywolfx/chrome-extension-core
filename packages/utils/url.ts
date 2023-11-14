import { url } from "./reg";

export const isUrl = (urlString: string) => url.test(urlString);
