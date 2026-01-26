import { useRef, useEffect, useState } from 'react';
import { chapterProgressAPI } from '../services/api';

const VideoPlayer = ({ src, title, chapterId }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (video.duration && video.currentTime && chapterId) {
                const progress = Math.floor((video.currentTime / video.duration) * 100);

                if (progress > 0 && progress <= 100) {
                    chapterProgressAPI.updateVideoProgress(chapterId, progress)
                        .catch(err => console.error('Error updating progress:', err));
                }
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);

            // Throttle: Update progress every 3 seconds while watching
            const now = Date.now();
            if (now - lastUpdateRef.current >= 3000) {
                updateProgress();
                lastUpdateRef.current = now;
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);

            // Resume from last position if chapterId is provided
            if (chapterId) {
                console.log('Fetching progress for chapter:', chapterId);
                chapterProgressAPI.getChapterProgress(chapterId)
                    .then(response => {
                        console.log('Progress API response:', response.data);
                        const savedProgress = response.data?.progress;
                        console.log('Saved progress:', savedProgress);
                        if (savedProgress && savedProgress > 0 && savedProgress < 100) {
                            // Calculate time from progress percentage
                            const resumeTime = (savedProgress / 100) * video.duration;
                            console.log(`Setting video time to: ${resumeTime}s (${savedProgress}%)`);
                            video.currentTime = resumeTime;
                            console.log(`Resumed video at ${savedProgress}% (${Math.floor(resumeTime)}s)`);
                        } else {
                            console.log('No valid progress to resume from:', savedProgress);
                        }
                    })
                    .catch(err => {
                        console.error('Error loading progress:', err);
                        console.error('Error details:', err.response?.data);
                    });
            } else {
                console.log('No chapterId provided, cannot resume');
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => {
            setIsPlaying(false);
            updateProgress(); // Update immediately on pause
        };
        const handleEnded = () => {
            setIsPlaying(false);
            if (chapterId) {
                chapterProgressAPI.updateVideoProgress(chapterId, 100)
                    .catch(err => console.error('Error updating progress:', err));
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, [chapterId, src]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (video) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * duration;
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="video-player-container">
            {title && <h3 className="video-title">{title}</h3>}

            <div className="video-wrapper">
                <video
                    ref={videoRef}
                    className="video-element"
                    src={src}
                    onClick={togglePlay}
                >
                    متصفحك لا يدعم تشغيل الفيديو
                </video>

                <div className="video-controls">
                    <button className="video-control-btn" onClick={togglePlay}>
                        {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        )}
                    </button>

                    <div className="video-volume-container">
                        <div className="volume-icon">
                            {volume === 0 ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <line x1="23" y1="9" x2="17" y2="15"></line>
                                    <line x1="17" y1="9" x2="23" y2="15"></line>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                </svg>
                            )}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="video-volume-slider"
                        />
                    </div>

                    <span className="video-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="video-progress-container" onClick={handleSeek}>
                        <div className="video-progress-bar">
                            <div
                                className="video-progress-filled"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
