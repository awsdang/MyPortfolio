import type { Shot } from "./types";
import { PROFILE } from "./profile";

/**
 * Photos window, opened from the photo widget on the desktop. Add a photo by
 * putting the file in public/photos/ and adding a line here; the grid and Quick
 * Look pick it up. Caption and source are optional.
 */
export const GALLERY: Shot[] = [{ src: PROFILE.photo.src, width: 400, height: 400, title: PROFILE.name, caption: "" }];
