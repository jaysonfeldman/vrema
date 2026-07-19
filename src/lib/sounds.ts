import { tiks } from '@rexa-developer/tiks';

let initialized = false;

export function initSounds() {
  if (initialized || typeof window === 'undefined') return;
  tiks.init({
    theme: 'soft',
    volume: 0.28,
    respectReducedMotion: true,
  });
  initialized = true;
}

function ensure() {
  initSounds();
}

export const sound = {
  click: () => {
    ensure();
    tiks.click();
  },
  toggle: (on: boolean) => {
    ensure();
    tiks.toggle(on);
  },
  success: () => {
    ensure();
    tiks.success();
  },
  error: () => {
    ensure();
    tiks.error();
  },
  pop: () => {
    ensure();
    tiks.pop();
  },
  swoosh: () => {
    ensure();
    tiks.swoosh();
  },
  notify: () => {
    ensure();
    tiks.notify();
  },
};
