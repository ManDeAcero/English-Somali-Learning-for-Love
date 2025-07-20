import os
import base64
import hashlib
from typing import Optional, Tuple
from google.cloud import texttospeech
from google.api_core import exceptions as google_exceptions
import logging

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        # Use API key authentication
        api_key = os.getenv('GOOGLE_TTS_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_TTS_API_KEY environment variable is required")
        
        # Initialize client with API key
        self.client = texttospeech.TextToSpeechClient.from_service_account_json = None
        # For API key authentication, we'll use REST API directly
        self.api_key = api_key
        self.base_url = "https://texttospeech.googleapis.com/v1/text:synthesize"
        
        # Somali voice configuration
        self.voice_config = {
            "language_code": "so-SO",  # Somali (Somalia)
            "name": "so-SO-Standard-B",  # Male voice
            "ssml_gender": texttospeech.SsmlVoiceGender.MALE
        }
        
        # Audio configuration
        self.audio_config = {
            "audio_encoding": texttospeech.AudioEncoding.MP3,
            "sample_rate_hertz": 24000,
            "effects_profile_id": ["telephony-class-application"]
        }

    def generate_cache_key(self, text: str, speed: float) -> str:
        """Generate a unique cache key for the audio request"""
        content = f"{text}-{speed}-so-SO"
        return hashlib.sha256(content.encode()).hexdigest()

    async def synthesize_speech(self, text: str, speed: float = 1.0) -> Tuple[str, str]:
        """
        Synthesize Somali speech from text
        Returns: (base64_audio_content, cache_key)
        """
        try:
            import requests
            import json
            
            cache_key = self.generate_cache_key(text, speed)
            
            # Prepare the request payload
            payload = {
                "input": {"text": text},
                "voice": {
                    "languageCode": "so-SO",
                    "name": "so-SO-Standard-B",
                    "ssmlGender": "MALE"
                },
                "audioConfig": {
                    "audioEncoding": "MP3",
                    "speakingRate": speed,
                    "sampleRateHertz": 24000,
                    "effectsProfileId": ["telephony-class-application"]
                }
            }
            
            # Make the API request
            url = f"{self.base_url}?key={self.api_key}"
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()
            
            result = response.json()
            audio_content = result.get("audioContent", "")
            
            logger.info(f"Successfully synthesized audio for text: {text[:50]}...")
            return audio_content, cache_key
            
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP error during TTS synthesis: {e}")
            raise Exception(f"Failed to synthesize speech: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during TTS synthesis: {e}")
            raise Exception(f"TTS service error: {str(e)}")

    def get_supported_voices(self) -> list:
        """Get list of supported Somali voices"""
        try:
            import requests
            
            url = f"https://texttospeech.googleapis.com/v1/voices?key={self.api_key}"
            response = requests.get(url)
            response.raise_for_status()
            
            data = response.json()
            somali_voices = [
                voice for voice in data.get("voices", [])
                if voice.get("languageCodes", [{}])[0].startswith("so")
            ]
            
            return somali_voices
        except Exception as e:
            logger.error(f"Error fetching supported voices: {e}")
            return []

    def estimate_audio_duration(self, text: str, speed: float) -> float:
        """Estimate audio duration in seconds"""
        # Average speaking rate: ~150 words per minute for normal speech
        words = len(text.split())
        base_duration = (words / 150) * 60  # Convert to seconds
        adjusted_duration = base_duration / speed
        return max(0.5, adjusted_duration)  # Minimum 0.5 seconds

# Global TTS service instance
tts_service = TTSService()