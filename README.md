# etete

A safe space for men and boys to share what they've been holding inside.

**etete** is an anonymous confession and voting app built as a private brotherhood. Post honestly, browse real stories, vote on questions that matter, and reply with support — without putting your real name on the line.

## Features

- **Welcome onboarding** — language (English, Amharic, Oromo), light/dark theme, and brother-focused intro slides
- **Anonymous confessions** — share under a light identity, not your real name
- **Feed** — browse posts with categories like Love/Cheating, Family, Work, Mental Health, and more
- **Voting** — ask live questions, pick an end date, vote anonymously, and review closed results
- **Full-screen Ask** — create polls with category, options, and calendar end date
- **Replies & threads** — leave support and nested replies on confessions
- **Upvotes / downvotes** — surface what resonates with the community
- **Search** — find confessions by topic or keyword
- **Save & My Confessions** — keep posts close and revisit what you shared
- **Guest mode** — browse without creating an account
- **Appearance** — switch theme and language preference later in settings

## Built with

- [Expo](https://expo.dev) (SDK 57)
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
  components/   # Confession cards, calendar, replies, skeletons
  data/         # Mock confessions, polls, and replies
  navigation/   # Auth, tabs, and stacks
  screens/      # Feed, post, voting, search, profile, welcome, and more
  store/        # App context, preferences, and theme
  types/        # Shared TypeScript types
```

## Note

This repo currently uses local mock data and in-app state. Backend auth and persistence can be added later.
