/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface PressableProps {
    className?: string | ((state: { pressed: boolean }) => string);
  }
  interface ImageProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
  }
}

// Custom type for our StreetStyles
declare global {
  type StreetStyleKey = 
    | 'screen' | 'container' | 'card' | 'cardElevated'
    | 'header' | 'headerTitle' | 'subheader'
    | 'title' | 'subtitle' | 'body' | 'caption' | 'label'
    | 'input' | 'inputLabel' | 'inputError' | 'inputFocused'
    | 'buttonPrimary' | 'buttonPrimaryText' | 'buttonPrimaryPressed'
    | 'buttonSecondary' | 'buttonSecondaryText' | 'buttonSecondaryPressed'
    | 'buttonGhost' | 'buttonGhostText' | 'buttonGhostPressed'
    | 'editButton' | 'editButtonText' | 'editButtonPressed'
    | 'deleteButton' | 'deleteButtonText' | 'deleteButtonPressed'
    | 'postCard' | 'postCardPressed' | 'postHeader' | 'postUsername'
    | 'postTimestamp' | 'postContent' | 'postFooter' | 'postStats' | 'postStat'
    | 'mediaContainer' | 'mediaImage'
    | 'form' | 'formSection' | 'formGroup'
    | 'tabBar' | 'tabButton' | 'tabButtonActive' | 'tabText' | 'tabTextActive'
    | 'divider' | 'shadow' | 'shadowMd' | 'shadowLg'
    | 'success' | 'warning' | 'error' | 'info';
}
