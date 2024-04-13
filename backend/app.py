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
import pandas as pd
from datetime import datetime
import io
from flask import send_file
import matplotlib.pyplot as plt
import base64


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
        sentence = data.get('prompt', '')
        print(sentence)
        sentences = []
        sentences.append(sentence)
        sentence = data.get('prompt', '')
        print(sentence)
        sentences = []
        sentences.append(sentence)
        src_lang = data.get('src_lang', '')
        tgt_lang = 'eng_Latn'
        print(sentences)
        print(sentences)

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
        print("Output:", outputs)
        print("Output:", outputs)
        print(outputs[0])
        return jsonify({'answer': outputs[0]})
    except Exception as e:
        return jsonify({"error": str(e)})
    
@flask_app.route('/translate_framed_pitch', methods=['POST'])
def translate_framed_pitch():
    try:
        data = request.get_json()
        sentence = data.get('prompt', '')
        print(sentence)
        sentences = []
        sentences.append(sentence)
        tgt_lang = data.get('src_lang', '')
        src_lang = 'eng_Latn'
        print(sentences)

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
        print("Output:", outputs)
        print(outputs[0])
        return jsonify({'answer': outputs[0]})
        return jsonify({'answer': outputs[0]})
    except Exception as e:
        return jsonify({"error": str(e)})
    
@flask_app.route('/translate_framed_pitch', methods=['POST'])
def translate_framed_pitch():
    try:
        data = request.get_json()
        sentence = data.get('prompt', '')
        print(sentence)
        sentences = []
        sentences.append(sentence)
        tgt_lang = data.get('src_lang', '')
        src_lang = 'eng_Latn'
        print(sentences)

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
        print("Output:", outputs)
        print(outputs[0])
        return jsonify({'answer': outputs[0]})
    except Exception as e:
        return jsonify({"error": str(e)})
        return jsonify({"error": str(e)})
    
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

# take details from llm model
@flask_app.route('/details', methods=['POST'])
def get_details():
    try:
        answers = request.get_json()

        # Process the answers as needed
        print(answers)

        response = jsonify({"message": "Answers received successfully"})
        return response
    except Exception as e:
        return jsonify({'error': str(e)})


# add the english pitch to embedchain and receive queries
@flask_app.route('/add_pitch_to_embedchain', methods=['POST'])
def add_pitch_to_embedchain():
    try:
        data = request.get_json()
        framed_pitch = data['framed_pitch']
        queries = data['queries']
        embedchain_app.add(framed_pitch, data_type='text')
        result = embedchain_app.query(queries)
        answer_index = result.find("Answer")
        if answer_index != -1:
            embedchain_result = result[answer_index + len("Answer: "):]
        else:
            embedchain_result = result
        return jsonify({"answer": embedchain_result})
    except Exception as e:
        return jsonify({"error": str(e)})

# bank statement
# @flask_app.route('/bank_statement', methods=['POST'])
# def bank_statement():
#     try:
#         data = request.get_json()
#         flask_app.add('bank_statement.csv', data_type='csv')
#         query = f"Can you give the approximate value of current year income, previous year income and next years income of the business based on the bank statement: "
#         income = embedchain_app.query(query)
#         answer_index = income.find("Answer:")
#         if answer_index != -1:
#             income = income[answer_index + len("Answer:"):] + "\n"
#             print(income)
#         else:
#             income = "No result"

#         return jsonify({"income": income})
    
#     except Exception as e:
#         return jsonify({"error": str(e)})

@flask_app.route('/analyze', methods=['POST'])
def analyze_statement():
    # Check if the POST request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    # Check if no file is selected
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Check if the file extension is allowed
    if not file.filename.lower().endswith(('.xls', '.xlsx')):
        return jsonify({'error': 'Invalid file format. Please upload an Excel file.'})

    try:
        df = pd.read_excel(file)
        df = df.iloc[21:-18]
        df = df.drop(df.columns[[0, 2]], axis=1)
        df = df.drop(df.index[1])
        df = df.fillna(0)
        df.rename(
            columns={'Unnamed: 1': 'UPIs', 'Unnamed: 3': 'Date', 'Unnamed: 4': 'Withdrawal', 'Unnamed: 5': 'Deposited',
                     'Unnamed: 6': 'Balance'},
            inplace=True)

        df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%y').dt.date
        df['Withdrawal'] = df['Withdrawal'].apply(lambda x: "{:.1f}".format(x)).astype(float)
        df['Deposited'] = df['Deposited'].apply(lambda x: "{:.1f}".format(x)).astype(float)
        df['Balance'] = df['Balance'].astype(float)
        df['UPIs'] = df['UPIs'].astype(str)
        df['UPIs'] = df['UPIs'].str.split('@', expand=True)[0]
        df['UPIs'] = df['UPIs'].str.split('-', expand=True)[1]
        df.index = range(1, len(df) + 1)

        start_date = df['Date'].iloc[0].strftime("%B %d %Y")
        end_date = df['Date'].iloc[-1].strftime("%B %d %Y")
        days = (df['Date'].iloc[-1] - df['Date'].iloc[0]).days
        total_withdrawal = df['Withdrawal'].sum()
        total_deposit = df['Deposited'].sum()
        closing_balance = df['Balance'].iloc[-1]
        opening_balance = df['Balance'].iloc[0]
        average_withdrawal_per_day = total_withdrawal / days
        average_withdrawal_per_month = total_withdrawal / (days / 30)

        analysis = {
            'statement_period': f"{start_date} to {end_date}",
            'number_of_days': days,
            'total_withdrawal': total_withdrawal,
            'total_deposit': total_deposit,
            'closing_balance': closing_balance,
            'opening_balance': opening_balance,
            'total_transactions': len(df),
            'average_withdrawal_per_day': average_withdrawal_per_day,
            'average_withdrawal_per_month': average_withdrawal_per_month
        }

        return jsonify({'success': True, 'data': analysis})

    except Exception as e:
        return jsonify({'error': str(e)})

#carbon footprint
content = """Agriculture: 1.5 kgCO2e per kg globally, lower in India.
            Energy: 1-2.5 kgCO2e per kWh from coal globally, significant in India.
            Transportation: 0.1-0.3 kgCO2e per km for road transport, slightly lower in India.
            Manufacturing: 1.8-2.2 kgCO2e per kg of steel, slightly higher in India.
            Construction: 0.5-3 kgCO2e per kg of construction material.
            Textiles: 10-40 kgCO2e per kg of textile, depending on material and process.
            Chemicals: Varies widely based on specific chemical and process.
            Automotive: 6-17 tonnes of CO2 per vehicle produced.
            Aviation: 0.9-3.4 kgCO2e per passenger-kilometer.
            Electronics: 0.5-1.5 kgCO2e per kg of product, varies based on components.
            Food and Beverage: 0.5-5 kgCO2e per kg of product, depending on type.
            Forestry and Logging: Varies based on practices and region.
            Mining: Varies widely based on type of mineral and extraction method.
            Oil and Gas: Varies based on extraction and refining processes.
            Paper and Pulp: 0.5-2 kgCO2e per kg of product.
            Pharmaceuticals: Varies based on product and process.
            Plastics: 1.5-5.5 kgCO2e per kg of product.
            Renewable Energy: Low to zero carbon footprint depending on source and lifecycle.
            Waste Management: Varies based on method and efficiency.
            Water and Wastewater Management: Varies based on treatment method."""
embedchain_app.add(content, data_type='text')

@flask_app.route('/carbon_footprint', methods=['POST'])
def carbon_footprint():
    try:
        data = request.get_json()
        framed_pitch = data['framed_pitch']
        #queries = "WHat is the carbon footprint generated by the industry mentioned in the pitch per kilogram, just give the numeric answer"
        queries= f"Give the carbon footprint generated per kilogram for the industry of this product pitch: {framed_pitch} in less than 50 words."

        result = embedchain_app.query(queries)
        answer_index = result.find("Answer:")
        if answer_index != -1:
            embedchain_result = result[answer_index + len("Answer: "):]
        else:
            embedchain_result = result

        score_query = f"Give the industry in the pitch a score(Low,Medium High) and (1-10), give just the keyword answer of the score: {framed_pitch}"
        score = embedchain_app.query(score_query)
        print(score)
        answer_index2 = score.find("Answer:")
        answer_index3 = score.find("Explanation:")
        if answer_index2 != -1:
            score = score[answer_index2 + len("Answer: "): answer_index3]
            
        else:
            score = score
        score_output = f"Sustainability Score: {score}"
        return jsonify({"sustainability": embedchain_result, "score": score_output})
    except Exception as e:
        return jsonify({"error": str(e)})

# add the english pitch to embedchain and receive queries

if __name__ == '__main__':
    flask_app.run(debug=True)
