import type { StateCreator } from 'zustand';

import type { SoundState } from './sound.state';

import { pickMany, random } from '@/helpers/random';

export interface SoundActions {
  lock: () => void;
  override: (sounds: Record<string, number>) => void;
  pause: () => void;
  play: () => void;
  restoreHistory: () => void;
  select: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  shuffle: () => void;
  toggleFavorite: (id: string) => void;
  togglePlay: () => void;
  unlock: () => void;
  unselect: (id: string) => void;
  unselectAll: (pushToHistory?: boolean) => void;
}

export const createActions: StateCreator<
  SoundActions & SoundState,
  [],
  [],
  SoundActions
> = (set, get) => {
  return {
    lock() {
      set({ locked: true });
    },

    override(newSounds) {
      get().unselectAll();

      const sounds = get().sounds;

      Object.keys(newSounds).forEach(sound => {
        if (sounds[sound]) {
          sounds[sound].isSelected = true;
          sounds[sound].volume = newSounds[sound];
        }
      });

      set({ history: null, sounds: { ...sounds } });
    },

    pause() {
      set({ isPlaying: false });
    },

    play() {
      set({ isPlaying: true });
    },

    restoreHistory() {
      const history = get().history;

      if (!history) return;

      set({ history: null, sounds: history });
    },

    select(id) {
      set({
        history: null,
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], isSelected: true },
        },
      });
    },

    setVolume(id, volume) {
      set({
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], volume },
        },
      });

      // 保存音量设置到localStorage
      try {
        const sounds = get().sounds;
        const volumes = Object.keys(sounds).reduce((acc, soundId) => {
          acc[soundId] = sounds[soundId].volume;
          return acc;
        }, {} as Record<string, number>);
        
        localStorage.setItem('moodist-volumes', JSON.stringify(volumes));
      } catch (error) {
        console.warn('Failed to save volume settings:', error);
      }
    },

    shuffle() {
      const sounds = get().sounds;
      const ids = Object.keys(sounds);
      const savedVolumes = JSON.parse(localStorage.getItem('moodist-volumes') || '{}');

      ids.forEach(id => {
        sounds[id].isSelected = false;
        sounds[id].volume = savedVolumes[id] ?? 0.5;
      });

      const randomIDs = pickMany(ids, 4);

      randomIDs.forEach(id => {
        sounds[id].isSelected = true;
        sounds[id].volume = random(0.2, 1);
      });

      // 保存新的音量设置
      try {
        const volumes = Object.keys(sounds).reduce((acc, soundId) => {
          acc[soundId] = sounds[soundId].volume;
          return acc;
        }, {} as Record<string, number>);
        
        localStorage.setItem('moodist-volumes', JSON.stringify(volumes));
      } catch (error) {
        console.warn('Failed to save volume settings:', error);
      }

      set({ history: null, isPlaying: true, sounds });
    },

    toggleFavorite(id) {
      const sounds = get().sounds;
      const sound = sounds[id];

      set({
        history: null,
        sounds: {
          ...sounds,
          [id]: { ...sound, isFavorite: !sound.isFavorite },
        },
      });
    },

    togglePlay() {
      set({ isPlaying: !get().isPlaying });
    },

    unlock() {
      set({ locked: false });
    },

    unselect(id) {
      set({
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], isSelected: false },
        },
      });
    },

    unselectAll(pushToHistory = false) {
      const noSelected = get().noSelected();

      if (noSelected) return;

      const sounds = get().sounds;

      if (pushToHistory) {
        const history = JSON.parse(JSON.stringify(sounds));
        set({ history });
      }

      const ids = Object.keys(sounds);
      const savedVolumes = JSON.parse(localStorage.getItem('moodist-volumes') || '{}');

      ids.forEach(id => {
        sounds[id].isSelected = false;
        sounds[id].volume = savedVolumes[id] ?? 0.5;
      });

      set({ sounds });

      // 保存新的音量设置到localStorage
      try {
        const volumes = Object.keys(sounds).reduce((acc, soundId) => {
          acc[soundId] = sounds[soundId].volume;
          return acc;
        }, {} as Record<string, number>);
        
        localStorage.setItem('moodist-volumes', JSON.stringify(volumes));
      } catch (error) {
        console.warn('Failed to save volume settings:', error);
      }
    },
  };
};
