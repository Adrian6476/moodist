/**
 * 配置MediaSession API以支持iOS后台播放
 * @param isPlaying - 当前是否正在播放
 * @param title - 正在播放的声音标题
 * @param onPlay - 播放回调
 * @param onPause - 暂停回调
 */
export function setupMediaSession(
  isPlaying: boolean,
  title: string,
  onPlay: () => void,
  onPause: () => void
) {
  if ('mediaSession' in navigator) {
    // 设置媒体会话元数据
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: 'Moodist',
      album: 'Ambient Sounds',
      artwork: [
        {
          src: '/ios-assets/icons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
        // 添加更多尺寸的图标支持
        {
          src: '/favicon.svg',
          type: 'image/svg+xml',
        }
      ],
      // @ts-ignore - 添加一些额外的元数据
      genre: 'Ambient',
      year: new Date().getFullYear().toString()
    });

    // 立即更新播放状态
    try {
      if ('setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: Infinity, // 无限持续时间
          position: 0,
          playbackRate: 1
        });
      }
    } catch (error) {
      console.warn('Failed to set position state:', error);
    }

    // 更新播放状态
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // 设置媒体控制处理程序
    const handlers = {
      play: () => {
        onPlay();
        navigator.mediaSession.playbackState = 'playing';
      },
      pause: () => {
        onPause();
        navigator.mediaSession.playbackState = 'paused';
      },
      stop: () => {
        onPause();
        navigator.mediaSession.playbackState = 'none';
      },
      previoustrack: null,
      nexttrack: null,
      seekbackward: null,
      seekforward: null,
      seekto: null
    };

    // 注册所有媒体控制处理程序
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(
          action as MediaSessionAction,
          handler
        );
      } catch (error) {
        console.warn(`Warning: Media session action "${action}" is not supported`);
      }
    });

    // 为macOS控制中心添加额外的位置更新
    if (typeof navigator.mediaSession.setPositionState === 'function') {
      navigator.mediaSession.setPositionState({
        duration: 24 * 60 * 60, // 设置一个较长的持续时间（24小时）
        playbackRate: 1,
        position: 0 // 环境音乐没有实际的进度
      });
    }
  }
}