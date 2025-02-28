/**
 * iOS音频会话管理
 * 在iOS上需要一个用户交互触发的音频上下文来启用后台播放
 */

let iOSAudioInstance: ReturnType<typeof createiOSAudio> | null = null;

function createiOSAudio() {
  if (typeof window === 'undefined') {
    return {
      silentAudio: null,
      getAudioContext: () => null,
      initAudioContext: () => null
    };
  }

  // 创建一个静音的音频元素来保持iOS音频会话
  const silentAudio = new window.Audio();
  silentAudio.loop = true;
  silentAudio.muted = false; // 不能设为静音，否则iOS不会保持音频会话
  silentAudio.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
  
  // 处理Web Audio上下文
  let audioContext: AudioContext | null = null;

  function initAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContext = new AudioContext();
        
        // iOS需要resumed状态
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      }
    }
    return audioContext;
  }

  // 在用户交互时初始化音频
  function initializeAudio() {
    silentAudio.play().catch(() => {
      // 忽略自动播放策略错误
    });
    initAudioContext();
    
    // 移除事件监听器
    window.removeEventListener('touchstart', initializeAudio);
    window.removeEventListener('touchend', initializeAudio);
    window.removeEventListener('click', initializeAudio);
  }

  // 监听用户交互事件
  window.addEventListener('touchstart', initializeAudio);
  window.addEventListener('touchend', initializeAudio);
  window.addEventListener('click', initializeAudio);

  // 防止iOS在切换到后台时暂停音频
  if (typeof window !== 'undefined' && window.AudioContext && 'audioWorklet' in AudioContext.prototype) {
    window.addEventListener('visibilitychange', () => {
      if (document.hidden && audioContext) {
        // 保持音频上下文活跃
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        gain.gain.value = 0.0001; // 几乎听不见的音量
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
      }
    });
  }

  return {
    silentAudio,
    getAudioContext: () => audioContext,
    initAudioContext
  };
}

export function setupiOSAudio() {
  if (!iOSAudioInstance) {
    iOSAudioInstance = createiOSAudio();
  }
  return iOSAudioInstance;
}