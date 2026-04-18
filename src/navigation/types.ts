import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  DeckDetail: { deckId: string };
  CreateDeck: undefined;
  CreateFlashcard: { deckId: string };
  Study: { deckId: string };
  CreateGroup: undefined;
  GroupDetail: { grupoId: string };
};

export type StackNav = NativeStackNavigationProp<RootStackParamList>;
export type StackRoute<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
