import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-database.js";

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA_0f0OS1AYgrCiZHQ9kAWzdn8TwzAuZ5A",
    authDomain: "ecoball-database.firebaseapp.com",
    databaseURL: "https://ecoball-database-default-rtdb.firebaseio.com",
    projectId: "ecoball-database",
    storageBucket: "ecoball-database.appspot.com",
    messagingSenderId: "124474531451",
    appId: "1:124474531451:web:f1eb1ac9540e0b7e404cde"
};

class Leaderboard {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.init();
    }

    async init() {
        await this.loadLeaderboard();
        this.setupEventListeners();
    }

    async loadLeaderboard() {
        try {
            const dbRef = ref(this.db, 'Classifica/');
            const snapshot = await get(dbRef);
            
            if (snapshot.exists()) {
                this.processData(snapshot);
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Errore nel caricamento della classifica:', error);
            this.showErrorState();
        }
    }

    processData(snapshot) {
        const punti = [];
        const ID = [];
        const nomi = [];

        snapshot.forEach(childSnapshot => {
            punti.push(childSnapshot.val().Punteggio);
            nomi.push(childSnapshot.val().Nome);
            ID.push(childSnapshot.key);
        });

        // Ordinamento
        for (let x = 1; x < punti.length; x++) {
            const confrontopunti = punti[x];
            const confrontoid = ID[x];
            const confrontonomi = nomi[x];
            let contatore = x - 1;
            
            for (; contatore >= 0 && punti[contatore] < confrontopunti; contatore--) {
                punti[contatore + 1] = punti[contatore];
                ID[contatore + 1] = ID[contatore];
                nomi[contatore + 1] = nomi[contatore];
            }
            punti[contatore + 1] = confrontopunti;
            ID[contatore + 1] = confrontoid;
            nomi[contatore + 1] = confrontonomi;
        }

        this.updateUI(punti, ID, nomi);
    }

    updateUI(punti, ID, nomi) {
        // Aggiorna punteggi
        document.getElementById("primo").textContent = punti[0] || 0;
        document.getElementById("secondo").textContent = punti[1] || 0;
        document.getElementById("terzo").textContent = punti[2] || 0;

        // Aggiorna nomi
        document.getElementById("firName").textContent = nomi[0] || 'N/D';
        document.getElementById("secName").textContent = nomi[1] || 'N/D';
        document.getElementById("thiName").textContent = nomi[2] || 'N/D';

        // Setup ID con effetto hover
        this.setupIdHover('idprimo', ID[0]);
        this.setupIdHover('idsecondo', ID[1]);
        this.setupIdHover('idterzo', ID[2]);
    }

    setupIdHover(elementId, fullId) {
        const element = document.getElementById(elementId);
        if (!element || !fullId) return;

        const idDisplay = element.querySelector('.id-display');
        const idFull = element.querySelector('.id-full');
        
        if (!idDisplay || !idFull) return;

        // Crea ID mascherato
        let maskedId = "";
        for(let i = 0; i < 14; i++) {
            if(i === 0 || (i + 1) % 5 === 0 || i % 5 === 0) {
                maskedId += fullId[i] || "#";
            } else {
                maskedId += "#";
            }
        }

        idDisplay.textContent = maskedId;
        idFull.textContent = fullId;

        // Rimuovi event listener precedenti e aggiungi nuovo
        element.removeEventListener('mouseenter', this.showFullId);
        element.removeEventListener('mouseleave', this.hideFullId);
        
        element.addEventListener('mouseenter', this.showFullId);
        element.addEventListener('mouseleave', this.hideFullId);
    }

    showFullId(e) {
        const idDisplay = e.currentTarget.querySelector('.id-display');
        const idFull = e.currentTarget.querySelector('.id-full');
        idDisplay.style.opacity = '0';
        idFull.style.display = 'block';
    }

    hideFullId(e) {
        const idDisplay = e.currentTarget.querySelector('.id-display');
        const idFull = e.currentTarget.querySelector('.id-full');
        idDisplay.style.opacity = '1';
        idFull.style.display = 'none';
    }

    showEmptyState() {
        // Mostra stato vuoto
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = 'Nessun dato';
        });
    }

    showErrorState() {
        // Mostra stato errore
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = 'Errore caricamento';
        });
    }

    setupEventListeners() {
        // Real-time updates
        const dbRef = ref(this.db, 'Classifica/');
        onValue(dbRef, (snapshot) => {
            this.loadLeaderboard();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Leaderboard();
    
    // Update copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});