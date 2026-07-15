# etete

A safe space to share what you've been holding inside.

**etete** is an anonymous confession app for honest, non-judgmental sharing. Post what’s on your mind, browse others’ stories, and reply with support — without putting your real name on the line.

## Features

- **Anonymous confessions** — share under a light identity, not your real name
- **Feed** — browse posts sorted by new, top, or oldest
- **Categories** — Love, Family, Work, Mental Health, Friendship, School & College, Finance, Health, Technology, and more
- **Replies & threads** — leave support and nested replies on confessions
- **Upvotes / downvotes** — surface what resonates with the community
- **Search** — find confessions by topic or keyword
- **Save & My Confessions** — keep posts close and revisit what you shared
- **Guest mode** — browse without creating an account

## Built with

- [Expo](https://expo.dev) (SDK 56)
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
  components/   # Confession cards, replies, skeletons
  data/         # Mock confessions and replies
  navigation/   # Auth, tabs, and stacks
  screens/      # Feed, post, search, profile, and more
  store/        # App context and theme
  types/        # Shared TypeScript types
```

## Note

This repo currently uses local mock data and in-app state. Backend auth and persistence can be added later.
