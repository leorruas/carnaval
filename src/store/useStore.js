import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveUserFavorites } from '../services/syncService';

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

        // Debounced cloud sync if authenticated
        // Clear previous timeout to reset the 2s delay
        if (syncTimeout) clearTimeout(syncTimeout);

        if (state.user?.uid) {
          syncTimeout = setTimeout(() => {
            // Use get() to fetch latest state at sync time
            saveUserFavorites(
              state.user.uid,
              get().favoriteBlocks,
              state.user.displayName || 'Folião'
            ).catch(err => {
              console.error('Failed to sync favorites to cloud:', err);
            });
          }, 2000); // 2 second debounce
        }
      },

      // Force immediate sync (e.g., before sharing)
      syncNow: async () => {
        const state = get();
        if (syncTimeout) clearTimeout(syncTimeout);

        if (state.user?.uid) {
          try {
            await saveUserFavorites(
              state.user.uid,
              state.favoriteBlocks,
              state.user.displayName || 'Folião'
            );
          } catch (err) {
            console.error('Failed to force sync favorites:', err);
            throw err;
          }
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

      addFriend: (friend) => set((state) => {
        const alreadyExists = state.friends.some(f => f.shareId === friend.shareId);
        if (alreadyExists) return state;
        return { friends: [...state.friends, friend] };
      }),

      removeFriend: (shareId) => set((state) => ({
        friends: state.friends.filter(f => f.shareId !== shareId)
      })),
    }),
    {
      name: 'carnaval-bh-storage',
    }
  )
);

export default useStore;
