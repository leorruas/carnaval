import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveUserData } from '../services/syncService';

// Debounce timer for Firebase sync
let syncTimeout = null;

const useStore = create(
  persist(
    (set, get) => ({
      // Estado do usuário
      user: null,
      isAuthenticated: false,

      // Blocos favoritados pelo usuário
      favoriteBlocks: [],

      // Configurações de notificação
      notificationSettings: {
        enabled: true,
        intervals: [30, 60], // minutos antes
      },

      // Amigos
      friends: [],

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: () => set({ user: null, isAuthenticated: false }),

      setFavorites: (favorites) => set({ favoriteBlocks: favorites }),

      toggleFavorite: (blockId) => {
        const state = get();
        const isFavorited = state.favoriteBlocks.some(b => b.id === blockId);
        let newFavorites;

        if (isFavorited) {
          newFavorites = state.favoriteBlocks.filter(b => b.id !== blockId);
        } else {
          // Adiciona o bloco com configurações padrão
          const newBlock = {
            id: blockId,
            addedAt: new Date().toISOString(),
            notificationIntervals: state.notificationSettings.intervals
          };
          newFavorites = [...state.favoriteBlocks, newBlock];
        }

        set({ favoriteBlocks: newFavorites });

        // Sync immediately if authenticated
        if (state.user?.uid) {
          saveUserData(
            state.user.uid,
            { favorites: newFavorites, friends: state.friends },
            state.user.displayName || 'Folião'
          ).catch(err => {
            // Silent fail for background sync to avoid interrupting user flow
            // but log it. Real-time feedback could be added later.
            console.error('Background sync failed:', err);
          });
        }
      },

      // Force immediate sync (non-blocking)
      syncNow: async () => {
        const state = get();
        if (state.user?.uid) {
          saveUserData(
            state.user.uid,
            { favorites: state.favoriteBlocks, friends: state.friends },
            state.user.displayName || 'Folião'
          ).catch(err => console.error('Manual sync failed:', err));
        }
      },

      isFavorited: (blockId) => {
        return get().favoriteBlocks.some(b => b.id === blockId);
      },

      updateNotificationSettings: (settings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings }
      })),

      updateBlockNotifications: (blockId, intervals) => set((state) => ({
        favoriteBlocks: state.favoriteBlocks.map(b =>
          b.id === blockId ? { ...b, notificationIntervals: intervals } : b
        )
      })),

      setFriends: (friends) => set({ friends }),

      addFriend: (friend) => {
        const state = get();
        const alreadyExists = state.friends.some(f => f.shareId === friend.shareId);
        if (alreadyExists) return;

        const newFriends = [...state.friends, friend];
        set({ friends: newFriends });

        // Sync if authenticated
        if (state.user?.uid) {
          saveUserData(
            state.user.uid,
            { favorites: state.favoriteBlocks, friends: newFriends },
            state.user.displayName || 'Folião'
          ).catch(e => console.error('Friend sync failed:', e));
        }
      },

      removeFriend: (shareId) => {
        const state = get();
        const newFriends = state.friends.filter(f => f.shareId !== shareId);
        set({ friends: newFriends });

        // Sync if authenticated
        if (state.user?.uid) {
          saveUserData(
            state.user.uid,
            { favorites: state.favoriteBlocks, friends: newFriends },
            state.user.displayName || 'Folião'
          ).catch(e => console.error('Friend remove sync failed:', e));
        }
      },
    }),
    {
      name: 'carnaval-bh-storage',
    }
  )
);

export default useStore;
