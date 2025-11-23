// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_0f0OS1AYgrCiZHQ9kAWzdn8TwzAuZ5A",
    authDomain: "ecoball-database.firebaseapp.com",
    databaseURL: "https://ecoball-database-default-rtdb.firebaseio.com",
    projectId: "ecoball-database",
    storageBucket: "ecoball-database.appspot.com",
    messagingSenderId: "124474531451",
    appId: "1:124474531451:web:f1eb1ac9540e0b7e404cde"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let googleMap;
let markers = [];
let totalPoints = 0;

// Initialize the map when Google Maps is loaded
function initMap() {
    // Map options
    const optionsMap = {
        zoom: 6,
        center: new google.maps.LatLng(43.094056784340914, 12.505439322730146),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    };

    // Initialize map
    googleMap = new google.maps.Map(document.getElementById('googleMap'), optionsMap);
    
    // Load data from Firebase
    loadFirebaseData();
    
    // Update stats
    updateStats();
}

// Load data from Firebase
function loadFirebaseData() {
    const dbRef = database.ref('ecoBall/');
    
    dbRef.on('value', (snapshot) => {
        clearMarkers();
        totalPoints = 0;
        
        const data = snapshot.val();
        if (data) {
            for (let pointId in data) {
                if (data.hasOwnProperty(pointId)) {
                    createMarker(data[pointId], pointId);
                    totalPoints++;
                }
            }
            
            document.getElementById('totalPoints').textContent = totalPoints;
            document.getElementById('activeDevices').textContent = countUniqueDevices(data);
            updateSummaryStats(data);
        }
    });
}

function countUniqueDevices(data) {
    const devices = new Set();
    for (let pointId in data) {
        if (data[pointId].deviceId) {
            devices.add(data[pointId].deviceId);
        }
    }
    return devices.size;
}

function createMarker(pointData, pointId) {
    const { Latitudine, Longitudine, Orario, Data, TDS, torb } = pointData;
    
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(Latitudine, Longitudine),
        map: googleMap,
        title: `Dati: ${Orario}`,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getMarkerColor(TDS, torb),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
    });

    const infoContent = `
        <div style="min-width: 200px; padding: 10px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1a1a1a;">Dati Monitoraggio</h3>
            <div style="display: grid; gap: 5px; font-size: 14px;">
                <div><strong>Coordinate:</strong> ${Latitudine?.toFixed(6)}, ${Longitudine?.toFixed(6)}</div>
                <div><strong>Data:</strong> ${Data}</div>
                <div><strong>Ora:</strong> ${Orario}</div>
                <div><strong>TDS:</strong> ${TDS || 'N/D'} ppm</div>
                <div><strong>Torbidità:</strong> ${torb || 'N/D'} NTU</div>
            </div>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });

    marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
    });

    markers.push(marker);
}

function getMarkerColor(tds, turbidity) {
    tds = tds || 0;
    turbidity = turbidity || 0;
    
    if (tds < 50 && turbidity < 5) return '#00cc66';
    if (tds < 100 && turbidity < 10) return '#66ff66';
    if (tds < 200 && turbidity < 20) return '#ffff66';
    if (tds < 300 && turbidity < 30) return '#ff9966';
    return '#ff5050';
}

function updateSummaryStats(data) {
    let totalTDS = 0;
    let totalTurbidity = 0;
    let count = 0;

    for (let pointId in data) {
        const point = data[pointId];
        if (point.TDS) {
            totalTDS += point.TDS;
            totalTurbidity += point.torb || 0;
            count++;
        }
    }

    if (count > 0) {
        document.getElementById('avg-tds').textContent = Math.round(totalTDS / count);
        document.getElementById('avg-turbidity').textContent = Math.round(totalTurbidity / count);
        document.getElementById('data-quality').textContent = '95%';
        document.getElementById('update-frequency').textContent = Math.round(count / 24);
    }
}

function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
}

function updateStats() {
    // Update copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
});

// Error handling
window.gm_authFailure = function() {
    alert('Errore nel caricamento di Google Maps. Controlla la tua connessione internet.');
};