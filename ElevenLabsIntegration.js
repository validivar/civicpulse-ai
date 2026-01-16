// Voice Input Component
import { ElevenLabsClient } from 'elevenlabs';

const recordVoice = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: true 
  });
  
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks);
    
    // Send to ElevenLabs for transcription
    const transcript = await elevenlabs.transcribe(audioBlob);
    
    // Process and submit to backend
    await submitIssue(transcript);
  };
  
  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 5000);
};