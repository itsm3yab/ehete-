# ehete (እህቴ)

Private project. Not open source.

A safe space for women and girls to share what they've been holding inside.

**ehete** (እህቴ — "my sister") is an anonymous confession and voting app built as a private sisterhood. Post honestly, browse real stories, vote on questions that matter, and reply with support — without putting your real name on the line.

## Features

- **Welcome onboarding** — language (English, Amharic, Oromo), light/dark theme, and sister-focused intro slides
- **Login & signup** — phone/username + password, with guest browsing
- **Anonymous confessions** — share under a light identity, not your real name
- **Feed** — browse posts with categories; top bar hides while scrolling
- **Voting** — ask live questions, vote anonymously, review closed results
- **Warn / Know him / Cycle / SOS** — safety tools in the bottom nav
- **Sidebar** — voting, saves, settings, and edit profile
- **Replies & threads** — leave support and nested replies on confessions
- **Guest mode** — browse without creating an account
- **Theme/Language** — switch appearance and language in settings

## Built with

- Expo (SDK 57)
- React Native + TypeScript
- React Navigation (tabs + stack)

## Getting started

```bash
npm install
npx expo start
```

Then open the app in Expo Go, an Android/iOS emulator, or the web preview.

## Project structure

```
src/
  components/   # Cards, sidebar, calendar, modals
  data/         # Mock confessions, polls, and replies
  navigation/   # Auth, tabs, and stacks
  screens/      # Feed, post, voting, search, profile, welcome, and more
  store/        # App context, preferences, and theme
  types/        # Shared TypeScript types
```

## Note

This repo is private. It currently uses local mock data and in-app state. Backend auth and persistence can be added later.
