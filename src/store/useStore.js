import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      toggleFavorite: (blockId) => set((state) => {
        const isFavorited = state.favoriteBlocks.some(b => b.id === blockId);
        if (isFavorited) {
          return {
            favoriteBlocks: state.favoriteBlocks.filter(b => b.id !== blockId)
          };
        } else {
          // Adiciona o bloco com configurações padrão
          return {
            favoriteBlocks: [...state.favoriteBlocks, {
              id: blockId,
              addedAt: new Date().toISOString(),
              notificationIntervals: state.notificationSettings.intervals
            }]
          };
        }
      }),

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
