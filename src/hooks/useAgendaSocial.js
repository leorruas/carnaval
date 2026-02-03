export const useAgendaSocial = (
    auth,
    friendsList,
    sharedData,
    addFriend,
    setActiveView,
    setSearchParams,
    setIsLoginModalOpen
) => {

    const handleFollow = () => {
        if (!auth.currentUser) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!sharedData) return;

        addFriend({
            shareId: sharedData.id,
            name: sharedData.ownerName,
            isLive: sharedData.isLive,
            addedAt: new Date().toISOString()
        });
        // Immediately switch to agenda view
        setActiveView('mine');
    };

    const handleViewFriend = (friend) => {
        if (friend.isLive) {
            setSearchParams({ uid: friend.shareId });
        } else {
            setSearchParams({ shareId: friend.shareId });
        }
        setActiveView('mine');
    };

    return {
        handleFollow,
        handleViewFriend
    };
};
