// Script para limpar IndexedDB e corrigir estado corrompido do Firestore
console.log('🧹 Limpando IndexedDB do Firestore...');

// Listar todos os bancos IndexedDB
indexedDB.databases().then(databases => {
    console.log('Bancos IndexedDB encontrados:', databases);

    // Deletar bancos relacionados ao Firestore
    databases.forEach(db => {
        if (db.name && db.name.includes('firestore')) {
            console.log(`Deletando: ${db.name}`);
            const deleteRequest = indexedDB.deleteDatabase(db.name);

            deleteRequest.onsuccess = () => {
                console.log(`✅ ${db.name} deletado com sucesso`);
            };

            deleteRequest.onerror = () => {
                console.error(`❌ Erro ao deletar ${db.name}`);
            };
        }
    });

    console.log('\n✅ Limpeza concluída! Recarregue a página (Cmd+Shift+R)');
});
