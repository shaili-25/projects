const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let localStream;
let remoteStream;
let peerConnection;

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Start video call
startButton.addEventListener('click', async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Setup text chat using WebSocket
    const ws = new WebSocket('wss://your-server.com/chat');

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        appendMessage(message.sender, message.text);
    };

    sendButton.addEventListener('click', () => {
        const message = chatInput.value;
        ws.send(JSON.stringify({ text: message }));
        appendMessage('You', message);
        chatInput.value = '';
    });

    startButton.disabled = true;
    stopButton.disabled = false;
});

// Stop video call
stopButton.addEventListener('click', () => {
    localStream.getTracks().forEach(track => track.stop());
    if (peerConnection) {
        peerConnection.close();
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    startButton.disabled = false;
    stopButton.disabled = true;
});

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
}
