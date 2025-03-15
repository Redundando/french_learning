from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from gtts import gTTS
import tempfile
import os
import base64
from vocabulary.models import Vocabulary


@require_GET
def text_to_speech(request):
    """
    Convert text to speech and return audio file
    Accepts 'text' parameter or 'word_id' parameter
    """
    word_id = request.GET.get('word_id')
    text = request.GET.get('text')

    # If word_id is provided, fetch the word from database
    if word_id:
        try:
            vocabulary = Vocabulary.objects.get(id=word_id)
            text = vocabulary.french_word
        except Vocabulary.DoesNotExist:
            return JsonResponse({'error': 'Word not found'}, status=404)

    # If no text is provided at all, return error
    if not text:
        return JsonResponse({'error': 'No text or word_id provided'}, status=400)

    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')

    try:
        # Generate speech
        tts = gTTS(text=text, lang='fr', slow=False)
        tts.save(temp_file.name)
        temp_file.close()

        # Read the audio file
        with open(temp_file.name, 'rb') as f:
            audio_data = f.read()

        # Encode as base64 for API response
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')

        return JsonResponse({
                'success': True,
                'audio'  : audio_base64,
                'text'   : text
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)