// Script de teste para verificar conexão direta com Firebase
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBElTVuiMpEzJ8nCNyGKQvTshVDfeb1NfE",
    authDomain: "tateno-app.firebaseapp.com",
    projectId: "tateno-app",
    storageBucket: "tateno-app.firebasestorage.app",
    messagingSenderId: "790111485975",
    appId: "1:790111485975:web:dd9941f3ff0f06eef3dc52",
    measurementId: "G-MDX7R03H3Q"
};

console.log('🔥 Iniciando teste de conexão Firebase...');

// Inicializar app
const app = initializeApp(firebaseConfig);
console.log('✅ App inicializado');

// Pegar Firestore SEM cache persistente (para testar conexão pura)
const db = getFirestore(app);
console.log('✅ Firestore instance obtida');

// Teste 1: Tentar ler um documento
async function testRead() {
    try {
        console.log('\n📖 Teste 1: Lendo documento...');
        const testRef = doc(db, 'test', 'connection');
        const snap = await getDoc(testRef);

        if (snap.exists()) {
            console.log('✅ Documento encontrado:', snap.data());
        } else {
            console.log('⚠️ Documento não existe (mas conexão OK)');
        }
    } catch (error) {
        console.error('❌ Erro ao ler:', error.code, error.message);
    }
}

// Teste 2: Tentar escrever um documento
async function testWrite() {
    try {
        console.log('\n✍️ Teste 2: Escrevendo documento...');
        const testRef = doc(db, 'test', 'connection');
        await setDoc(testRef, {
            timestamp: new Date().toISOString(),
            message: 'Test from connection script'
        });
        console.log('✅ Documento escrito com sucesso');
    } catch (error) {
        console.error('❌ Erro ao escrever:', error.code, error.message);
    }
}

// Teste 3: Tentar listar coleções
async function testList() {
    try {
        console.log('\n📋 Teste 3: Listando documentos da coleção users...');
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        console.log(`✅ Encontrados ${snapshot.size} documentos`);
    } catch (error) {
        console.error('❌ Erro ao listar:', error.code, error.message);
    }
}

// Executar testes
console.log('\n⏳ Executando testes em 2 segundos...\n');
setTimeout(async () => {
    await testRead();
    await testWrite();
    await testList();
    console.log('\n✅ Testes concluídos!');
}, 2000);
