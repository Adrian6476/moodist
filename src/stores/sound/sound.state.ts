import type { StateCreator } from 'zustand';

import type { SoundActions } from './sound.actions';

import { sounds } from '@/data/sounds';

export interface SoundState {
  getFavorites: () => Array<string>;
  history: {
    [id: string]: {
      isFavorite: boolean;
      isSelected: boolean;
      volume: number;
    };
  } | null;
  isPlaying: boolean;
  locked: boolean;
  noSelected: () => boolean;
  sounds: {
    [id: string]: {
      isFavorite: boolean;
      isSelected: boolean;
      volume: number;
    };
  };
}

export const createState: StateCreator<
  SoundState & SoundActions,
  [],
  [],
  SoundState
> = (set, get) => {
    // 从localStorage读取保存的音量设置
    const getSavedVolumes = () => {
      try {
        const saved = localStorage.getItem('moodist-volumes');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    };
  
    const state: SoundState = {
      getFavorites() {
        const { sounds } = get();
        const ids = Object.keys(sounds);
        const favorites = ids.filter(id => sounds[id].isFavorite);
  
        return favorites;
      },
      history: null,
      isPlaying: false,
      locked: false,
      noSelected() {
        const { sounds } = get();
        const keys = Object.keys(sounds);
  
        return keys.every(key => !sounds[key].isSelected);
      },
      sounds: {},
    };

  const { categories } = sounds;

  // 获取保存的音量设置
  const savedVolumes = getSavedVolumes();

  categories.forEach(category => {
    const { sounds } = category;

    sounds.forEach(sound => {
      state.sounds[sound.id] = {
        isFavorite: false,
        isSelected: false,
        volume: savedVolumes[sound.id] ?? 0.5, // 使用保存的音量或默认值
      };
    });
  });

  return state;
};
