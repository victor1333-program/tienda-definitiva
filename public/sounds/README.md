# Notification Sounds

This directory contains audio files for different types of notifications:

- `new-order.mp3` - Sound for new order notifications
- `alert.mp3` - Sound for stock alerts and system warnings  
- `message.mp3` - Sound for customer messages and contact forms
- `warning.mp3` - Sound for system alerts and errors

## Usage

These sounds are referenced in the notification service and played when certain events occur, provided the user has sound notifications enabled.

## File Requirements

- Format: MP3 (for best browser compatibility)
- Duration: 1-3 seconds recommended
- Volume: Normalized to avoid being too loud
- Size: Keep files small (<100KB) for fast loading

## Integration

The sounds are automatically loaded by the notification system when:
1. A notification is created that matches the type
2. The user has sound enabled in their notification settings
3. The browser tab is active and has audio permissions