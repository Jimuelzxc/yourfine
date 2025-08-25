# Ambient Sounds Directory

This directory contains the audio files for the ambient sounds feature in YourFine.

## Required Sound Files

To complete the ambient sounds implementation, add the following MP3 files to this directory:

- `rain.mp3` - Gentle rainfall sounds for concentration
- `forest.mp3` - Birds and nature sounds 
- `waves.mp3` - Calming ocean waves
- `whitenoise.mp3` - Consistent white noise
- `cafe.mp3` - Ambient coffee shop sounds

## File Requirements

- **Format**: MP3 (recommended for best browser compatibility)
- **Quality**: 128kbps or higher for good quality
- **Duration**: 2-10 minutes (files will loop automatically)
- **Size**: Keep files under 5MB each for faster loading

## Sound Sources

You can source ambient sounds from:
- [Freesound.org](https://freesound.org) (Creative Commons)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) (Free for personal use)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary) (Free)
- [Pixabay](https://pixabay.com/sound-effects/) (Free)

## Testing

After adding the sound files:
1. Open the app settings (gear icon)
2. Navigate to the "Ambient Sounds" section
3. Toggle "On" and select a sound
4. Adjust volume to test functionality

## Notes

- Files are loaded on-demand when selected
- Audio plays in a loop for continuous ambiance
- Volume and sound preferences are saved in localStorage
- All files are served statically from this public directory