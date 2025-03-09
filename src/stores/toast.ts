import { writable } from "svelte/store";

export const toastMessage = writable<string | null>(null);
export const showToast = writable<boolean>(false);

export function triggerToast(message: string, duration = 3000) {
  toastMessage.set(message);
  showToast.set(true);

  setTimeout(() => {
    showToast.set(false);
    toastMessage.set(null);
  }, duration);
}
