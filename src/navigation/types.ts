import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  DeckDetail: { deckId: string };
  CreateDeck: { editId?: string } | undefined;
  CreateFlashcard: { deckId: string; editId?: string };
  Study: { deckId: string };
  CreateGroup: undefined;
  AIGenerate: { deckId: string };
  Settings: undefined;
  Stats: undefined;
};

export type StackNav = NativeStackNavigationProp<RootStackParamList>;
export type StackRoute<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
