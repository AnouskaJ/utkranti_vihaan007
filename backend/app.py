from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForSeq2SeqLM
from IndicTransTokenizer import IndicProcessor, IndicTransTokenizer
import easyocr
import cv2
import base64
import numpy as np
import os
from embedchain import App
import json
import joblib

os.environ["HUGGINGFACE_ACCESS_TOKEN"] = "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"
embedchain_app = App.from_config("mistral.yaml")


#Flask
flask_app = Flask(__name__)
CORS(flask_app)

reader = easyocr.Reader(['en'], model_storage_directory='easyocr-models')

#AI4Bharat
# Load the translation models
en_indic_model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-en-indic-dist-200M", trust_remote_code=True)
indic_en_model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-indic-en-1B", trust_remote_code=True)

# Create the tokenizers
en_indic_tokenizer = IndicTransTokenizer(direction="en-indic")
indic_en_tokenizer = IndicTransTokenizer(direction="indic-en")

ip = IndicProcessor(inference=True)

languages = {
    "asm_Beng": "Assamese",
    "kas_Arab": "Kashmiri (Arabic)",
    "pan_Guru": "Punjabi",
    "ben_Beng": "Bengali",
    "kas_Deva": "Kashmiri (Devanagari)",
    "san_Deva": "Sanskrit",
    "brx_Deva": "Bodo",
    "mai_Deva": "Maithili",
    "sat_Olck": "Santali",
    "doi_Deva": "Dogri",
    "mal_Mlym": "Malayalam",
    "snd_Arab": "Sindhi (Arabic)",
    "eng_Latn": "English",
    "mar_Deva": "Marathi",
    "snd_Deva": "Sindhi (Devanagari)",
    "gom_Deva": "Konkani",
    "mni_Beng": "Manipuri (Bengali)",
    "tam_Taml": "Tamil",
    "guj_Gujr": "Gujarati",
    "mni_Mtei": "Manipuri (Meitei)",
    "tel_Telu": "Telugu",
    "hin_Deva": "Hindi",
    "npi_Deva": "Nepali",
    "urd_Arab": "Urdu",
    "kan_Knda": "Kannada",
    "ory_Orya": "Odia",
}


#For languages list
@flask_app.route('/languages', methods=['GET'])
def get_languages():
    return jsonify(languages)

# Translation from Source Language to Target Language 
# Model to convert indic pitch to English
@flask_app.route('/translate_pitch', methods=['POST'])
def translate_pitch():
    try:
        data = request.get_json()
        sentences = data['sentences']
        src_lang = data.get('src_lang', '')
        tgt_lang = 'eng_Latn'

        if src_lang == 'eng_Latn':
            model = en_indic_model
            tokenizer = en_indic_tokenizer
        else:
            model = indic_en_model
            tokenizer = indic_en_tokenizer

        batch = ip.preprocess_batch(sentences, src_lang=src_lang, tgt_lang=tgt_lang)
        batch = tokenizer(batch, src=True, return_tensors="pt")

        with torch.inference_mode():
            outputs = model.generate(**batch, num_beams=5, num_return_sequences=1, max_length=256)

        outputs = tokenizer.batch_decode(outputs, src=False)
        outputs = ip.postprocess_batch(outputs, lang=tgt_lang)
        print(outputs[0])
        return jsonify({'translations': outputs[0]})

    except Exception as e:
        return jsonify({'error': str(e)})
    
# English pitch to framed content
# convert outputs from /translate_pitch to Framed pitch
# also generate a summary of the pitch
@flask_app.route('/frame_pitch', methods=['POST'])
def frame_pitch():
    try:
        data = request.get_json()
        translated_pitch = data.get('translations', '')
        query = f"Frame this product pitch and create a points list for the key points for: {translated_pitch}?"
        framed_pitch = embedchain_app.query(query)
        answer_index = framed_pitch.find("Answer:")
        if answer_index != -1:
            framed_pitch = framed_pitch[answer_index + len("Answer:"):] + "\n"
            print(framed_pitch)
        else:
            framed_pitch = "No result"
        
        # # Preserve new line characters
        # formatted_framed_pitch = framed_pitch.split(".")
        # formatted_framed_pitch = ".\n".join(formatted_framed_pitch)
        
        query2 = f"Generate a summary in maximum one or two lines for this pitch: {framed_pitch}"
        summary = embedchain_app.query(query2)
        answer_index2 = summary.find("Answer:")
        if answer_index2 != -1:
            summary = summary[answer_index2 + len("Answer:"):] + "\n"
        else:
            summary = "No result"
        return jsonify({"framed_pitch": framed_pitch,
                        "summary": summary})
    
    except Exception as e:
        return jsonify({"error": str(e)})
    
if __name__ == '__main__':
    flask_app.run(debug=True)