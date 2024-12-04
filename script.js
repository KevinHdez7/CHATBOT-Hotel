// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            })
            .catch((error) => {
                console.log('Error al registrar el ServiceWorker:', error);
            });
    });
}


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDvU-dw_2iIqW8BbVxmH6SXqRX2y91VcbA",
    authDomain: "hotel-kin-f6d1a.firebaseapp.com",
    projectId: "hotel-kin-f6d1a",
    storageBucket: "hotel-kin-f6d1a.firebasestorage.app",
    messagingSenderId: "155476359246",
    appId: "1:155476359246:web:f893dd122c37a21db46b1f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos del DOM
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');
const openChatButton = document.getElementById('openChat');
const minimizeButton = document.getElementById('minimizeChat');

// Estado del chat
let isChatOpen = false;

// Funciones del chatbot
const botResponses = {
    "hola": "¡Hola! ¿En qué puedo ayudarte?",
    "habitaciones": "Contamos con habitaciones Standard, Deluxe y Suite con vista al mar.",
    "precios": "Los precios varían según la temporada y el tipo de habitación.",
    "ubicación": "Nos encontramos en la mejor playa de la costa, a solo 5 minutos del centro de la ciudad.",
    "servicios": "Ofrecemos servicio a la habitación 24/7, spa, restaurante, piscina infinity y actividades acuáticas.",
    "cancelación": "Puedes cancelar tu reserva hasta 48 horas antes de tu llegada sin penalización. Para más detalles, consulta nuestra política en el sitio web.",
    "pago": "Aceptamos pagos con tarjetas de crédito, débito y transferencias bancarias. También puedes pagar en efectivo al momento del check-in.",
    "promociones": "Actualmente ofrecemos un 20% de descuento en estancias de más de 3 noches.",
    "clima": "El clima en nuestra zona suele ser cálido y soleado. Asegúrate de traer ropa ligera y protector solar.",
    "transporte": "Ofrecemos un servicio de transporte desde el aeropuerto por un costo adicional.",
    "actividades": "En los alrededores puedes disfrutar de buceo, visitas a ruinas arqueológicas y tours en barco.",
    "wifi": "Tenemos conexión WiFi gratuita de alta velocidad en todas las áreas del hotel, incluyendo habitaciones y zonas comunes. La contraseña te será proporcionada al hacer check-in.",
    "piscina": "Tenemos una piscina infinity con vistas al mar y otra exclusiva para niños.",
    "horario del restaurante": "Nuestro restaurante está abierto de 7:00 AM a 10:00 PM. También puedes pedir servicio a la habitación las 24 horas.",
    "idiomas": "Nuestro personal habla español e inglés para asegurarte una experiencia cómoda.",
    "gimnasio": "Nuestro gimnasio está abierto de 6:00 AM a 10:00 PM. Cuenta con equipos de última generación para tu comodidad.",
    "estacionamiento": "Contamos con estacionamiento gratuito para todos nuestros huéspedes. También ofrecemos servicio de valet parking y vigilancia las 24 hrs.",
    "niños": "Los niños menores de 12 años se hospedan gratis en la misma habitación de sus padres. También contamos con actividades especiales para ellos.",
    "grupos": "Ofrecemos descuentos para reservas de más de 10 habitaciones.",
    "reservas": "Ofrecemos descuentos para reservas de más de 10 habitaciones.",
    "contacto": "Puedes llamarnos al +52 934-567-890 o enviarnos un correo a contacto@hotelkin.com. Estamos aquí para ayudarte.",
    "spa": "Nuestro spa está disponible todos los días de 8:00 AM a 8:00 PM. Contamos con servicio de masajes, tratamientos faciales y estéticos, comida saludable durante el día y promociones especiales para parejas o grupos más grandes.",
    "restaurante": "Tenemos opciones de desayuno, comida y cena. Nuestra gastronomia es internacional como local para una experiencia diferente para cada persona.",
    "eventos": "Contamos con salones para eventos corporativos, bodas, reuniones y celebraciones sociales con capacidad para hasta 200 personas.",
    "mascotas": "Somos pet-friendly.",
    "adios": "¡Hasta luego! Fue un placer atenderte. Que tengas un excelente día",
    "default": "Lo siento, no entiendo tu pregunta. ¿Podrías reformularla nuevamente?"
};

// Función para guardar la conversación en Firestore
async function saveToFirestore(conversation) {
    try {
        await addDoc(collection(db, 'chat_conversations'), {
            conversation: conversation,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving to Firestore: ", error);
    }
}

// Función para obtener respuesta del bot
function getBotResponse(message) {
    message = message.toLowerCase();
    for (let key in botResponses) {
        if (message.includes(key)) {
            return botResponses[key];
        }
    }
    return botResponses.default;
}

// Función para agregar mensaje al chat
function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user' : 'bot');
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

openChatButton.addEventListener('click', () => {
    chatContainer.style.display = 'flex';
    openChatButton.style.display = 'none';
    isChatOpen = true;
});

minimizeButton.addEventListener('click', () => {
    chatContainer.style.display = 'none';
    openChatButton.style.display = 'flex';
    isChatOpen = false;
});

// Función para enviar mensaje
async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        // Agregar mensaje del usuario al chat
        addMessage(message, true);
        userInput.value = '';

        // Obtener respuesta del bot
        const botResponse = getBotResponse(message);
        
        // Agregar respuesta del bot al chat
        setTimeout(() => {
            addMessage(botResponse, false);
        }, 500);

        // Crear objeto de conversación
        const conversation = {
            userMessage: message,
            botResponse: botResponse
        };

        // Guardar la conversación completa en Firestore
        await saveToFirestore(conversation);
    }
}