# StreetTalk

> Your voice, uncensored - A modern social media platform built with React Native

## About

StreetTalk is a social media application that empowers users to share their thoughts freely in a clean, modern interface. Built with React Native and powered by Firebase, it offers a seamless mobile experience with robust security and real-time features.

## Features

- **Secure Authentication** - Firebase Auth with username-based login
- **Post Creation** - Text posts with media support (images/videos)
- **Comments System** - Real-time commenting on posts
- **Modern UI** - Clean white theme with purple branding
- **Mobile-First** - Optimized for iOS and Android
- **Advanced Security** - XSS protection, input validation, homograph attack prevention
- **Real-time Updates** - Live post feeds and notifications
- **Media Upload** - Image and video sharing with Firebase Storage
- **Moderation Tools** - User blocking and content reporting
- **Rate Limiting** - Spam prevention and usage tracking

## Tech Stack

- **Frontend:** React Native with Expo
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Language:** TypeScript
- **Styling:** Native React Native StyleSheet
- **State Management:** React Context
- **Navigation:** React Navigation v6
- **Form Validation:** Zod
- **Media:** Expo Image Picker, Expo AV

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdeadwiler/StreetTalk.git
   cd StreetTalk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase configuration:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator  
- `npm run web` - Run on web browser
- `npx tsc --noEmit` - TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── post/           # Post-related components
│   └── ...
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── feed/          # Home feed screens
│   ├── post/          # Post creation/editing
│   ├── profile/       # User profile screens
│   └── settings/      # App settings
├── navigation/         # Navigation configuration
├── context/           # React Context providers
├── services/          # Firebase services
├── utils/             # Utility functions
├── styles/            # Design system
└── types/             # TypeScript type definitions
```

## Design System

StreetTalk uses a centralized design system with:

- **Color Palette**: Clean white backgrounds with purple accents
- **Typography**: Modern, readable font hierarchy
- **Components**: Consistent styling using `StreetColors`
- **Mobile-First**: 44px minimum touch targets, proper spacing

```typescript
// Example usage
import { StreetColors } from './src/styles/streetStyles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: StreetColors.background.primary, // #ffffff
    flex: 1,
  },
  primaryButton: {
    backgroundColor: StreetColors.brand.primary, // #4b0082
  }
});
```

## Security Features

- **Input Validation**: Zod schemas for all user inputs
- **XSS Prevention**: Content sanitization and escaping
- **Username Security**: Homograph attack prevention, Firestore-safe validation
- **Password Strength**: 12+ characters with complexity requirements
- **Rate Limiting**: Spam prevention for posts and comments
- **Firebase Rules**: Server-side security rules (see `firebase-rules/`)

## Deployment

### Expo Development Build

1. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

2. **Build for Android**
   ```bash
   eas build --platform android
   ```

### Firebase Deployment

1. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Storage rules**
   ```bash
   firebase deploy --only storage
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Firebase for backend services
- Expo for development platform
- React Native community for excellent tooling

## Contact

**Marquise Deadwiler** - [@mdeadwiler](https://github.com/mdeadwiler)

Project Link: [https://github.com/mdeadwiler/StreetTalk](https://github.com/mdeadwiler/StreetTalk)

---

Built with React Native and Firebase
