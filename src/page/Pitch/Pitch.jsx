import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdArrowBack } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { MdOutlineUploadFile } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { GiSpeaker } from "react-icons/gi";
import { IoMdSend } from "react-icons/io";
import { AiOutlineAudio } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";

export default function Ocr() {
  const [showFamilyPhoto, setShowFamilyPhoto] = useState(true);
  const [progress, setProgress] = useState(50);
  const [ocrResult, setOcrResult] = useState("");
  const [image, setImage] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languages, setLanguages] = useState({});
  const [speechToTextResult, setSpeechToTextResult] = useState(null);
  const [language, setLanguage] = useState("english");
  const [framedPitch, setFramedPitch] = useState("");
  const [translatedFramedPitch, setTranslatedFramedPitch] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [sustainability, setSustainability] = useState(null);
  const [sendClicked, setSendClicked] = useState(false);
  const [calculatingScore, setCalculatingScore] = useState(false);



  const handleSustainabilityScoreClick = (framedPitch) => async () => {
    try {
      setCalculatingScore(true); // Set the state to indicate calculation in progress
  
      const response = await axios.post('http://localhost:5000/carbon_footprint', { framed_pitch: framedPitch });
      const { sustainability, score } = response.data;
      setSustainability(sustainability);
      setScore(score);
      document.getElementById('sustainability_score_modal').showModal();
    } catch (error) {
      console.error('Error getting sustainability score:', error);
      alert('Error getting sustainability score. Please try again.');
    } finally {
      setCalculatingScore(false); // Reset the state after the calculation is done
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);

  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };


  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await axios.get("http://localhost:5000/languages");
        setLanguages(res.data);
        console.log(selectedLanguage);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    }
    fetchLanguages();
  }, []);

  const goBack = () => {
    window.history.back(); // Navigate back to the previous page
  };

  const handleSave = () => {
    setShowFamilyPhoto(!showFamilyPhoto); // Toggle the family photo display
  };

// Bank statement
const handleFileChange = async (e) => {
  setFile(e.target.files[0]);
  handleSubmit(); // Call handleSubmit immediately after setting the file
};

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('http://localhost:5000/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      setAnalysis(response.data.data);
    } else {
      console.error(response.data.error);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleClose = () => {
  setAnalysis(null);
};

// close

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      console.log("File read successfully:", reader.result);
      setProgress(0);
      setOcrResult("");
      setImage(reader.result);
      uploadImage(reader.result);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      console.error("No file selected.");
    }
  };

  const uploadImage = async (imageData) => {
    try {
      const response = await axios.post("http://localhost:5000/analyze", {
        imageData: imageData,
      });

      setOcrResult(response.data.text);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };


  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    setSendClicked(true);
    if (newMessage.trim() !== "") {
      try {
        let translationResponse;
        let frameResponse;
  
        // Call translate_pitch endpoint
        if (selectedLanguage === "eng_Latn") {
          translationResponse = await axios.post("http://localhost:5000/translate_pitch", {
            prompt: newMessage,
            src_lang: selectedLanguage,
          });
        } else {
          translationResponse = await axios.post(
            "http://localhost:5000/translate_pitch",
            {
              prompt: newMessage,
              src_lang: selectedLanguage,
            }
          );
        }
  
        // Extract translated sentence
        const translatedSentence = translationResponse.data.answer;
  
        // Call frame_pitch endpoint
        frameResponse = await axios.post("http://localhost:5000/frame_pitch", {
          translations: translatedSentence,
        });
  
        // Extract framed pitch and summary
        setFramedPitch(frameResponse.data.framed_pitch);
        setSummary(frameResponse.data.summary);
  
      // Update state with the messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, isUser: true },
        { text: translatedSentence, isUser: false },
        { text: framedPitch, isUser: false },
        { text: summary, isUser: false },
      ]);
      setNewMessage("");
        // Store the text-to-speech data
        const utterance = new SpeechSynthesisUtterance(answer);

        if (selectedLanguage !== "en") {
          switch (selectedLanguage) {
            case "guj_Gujr": //
              utterance.lang = "gu-IN";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "gu-IN");
              break;
            case "hin_Deva": //
              utterance.lang = "hi-IN";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "hi-IN");
              break;
            case "kan_Knda": //
              utterance.lang = "kn-IN";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "kn-IN");
              break;
            case "gom_Deva": //
              utterance.lang = "kok-IN";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "kok-IN");
              break;
            case "mar_Deva": //
              utterance.lang = "mr-IN";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "mr-IN");
              break;
            case "pan_Guru":
              utterance.lang = "pa-IN"; //
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "pa-IN");
              break;
            case "tam_Taml":
              utterance.lang = "ta-IN"; //
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "ta-IN");
              break;
            case "tel_Telu":
              utterance.lang = "te-IN"; //
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "te-IN");
              break;
            default:
              utterance.lang = "en-US";
              utterance.voice = speechSynthesis
                .getVoices()
                .find((voice) => voice.lang === "en-US");
              break;
          }
        } else {
          utterance.lang = "en-US";
          utterance.voice = speechSynthesis
            .getVoices()
            .find((voice) => voice.lang === "en-US");
        }
        setSpeechToTextResult(utterance);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

    const translateFramedPitch = async () => {
    try {
      const response = await axios.post("http://localhost:5000/translate_framed_pitch", {
        framed_pitch: framedPitch,
        src_lang: language,
      });
      setTranslatedFramedPitch(response.data.answer);
    } catch (error) {
      console.error("Error translating framed pitch:", error);
    }
  };


  const handleSpeechToText = async () => {
    try {
      const recognition = new window.webkitSpeechRecognition();
      let langCode = "en-US"; // Default language code

      switch (selectedLanguage) {
        case "guj_Gujr":
          langCode = "gu-IN";
          break;
        case "hin_Deva":
          langCode = "hi-IN";
          break;
        case "kan_Knda":
          langCode = "kn-IN";
          break;
        case "gom_Deva":
          langCode = "kok-IN";
          break;
        case "mar_Deva":
          langCode = "mr-IN";
          break;
        case "pan_Guru":
          langCode = "pa-IN";
          break;
        case "tam_Taml":
          langCode = "ta-IN";
          break;
        case "tel_Telu":
          langCode = "te-IN";
          break;
        default:
          langCode = "en-US";
          break;
      }

      recognition.lang = langCode;

      recognition.onresult = (event) => {
        const speechToTextResult = event.results[0][0].transcript;
        setNewMessage(speechToTextResult);
      };

      recognition.start();
    } catch (error) {
      console.error("Error converting speech to text:", error);
    }
  };

  const handlePlayButtonClick = () => {
    // Check if speech synthesis is speaking
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    } else {
      speechSynthesis.speak(speechToTextResult);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "hindi" : "english");
  };

  useEffect(() => {
    if (file) {
      handleSubmit();
    }
  }, [file]);

  useEffect(() => {
    if (analysis) {
      document.getElementById('analysis_modal').showModal();
    }
  }, [analysis]);

  return (
    <div className="flex bg-[#78abe8] justify-between items-center min-h-screen max-h-fit">
      <div className="bg-[#0e3a6e] w-[60%] h-fit px-2 py-10">
        <button
          onClick={goBack}
          className="-mt-5 mb-5 text-white hover:text-gray-300"
        >
          <MdArrowBack size={40} />
        </button>
        <div className="flex gap-6 items-center">
          <FaPlus className="ml-10 text-white" size={36} />
          <span className="text-3xl text-white font-semibold">
            {language === "english"
              ? "Welcome to Utkranti,"
              : "उत्क्रांति में आपका स्वागत है,"}
          </span>
        </div>

    <div>
      <input type="file" id="bank" style={{ display: "none" }} onChange={handleFileChange} />
      {/* <button onClick={handleSubmit}>Upload</button> */}
      {analysis && (
        <>
  <dialog id="analysis_modal" className="modal">
    <div className="modal-box">
      <span className="close" onClick={handleClose}>&times;</span>
      <h2>Financial Analysis</h2>
      <p>Statement Period: {analysis.statement_period}</p>
      <p>Number of Days: {analysis.number_of_days}</p>
      <p>Total Withdrawal: {analysis.total_withdrawal}</p>
      <p>Total Deposit: {analysis.total_deposit}</p>
      <p>Closing Balance: {analysis.closing_balance}</p>
      <p>Opening Balance: {analysis.opening_balance}</p>
      <p>Total Transactions: {analysis.total_transactions}</p>
      <p>Average Withdrawal per Day: {analysis.average_withdrawal_per_day}</p>
      <p>Average Withdrawal per Month: {analysis.average_withdrawal_per_month}</p>
    </div>
  </dialog>
        </>
)}

{/* Open the modal using document.getElementById('ID').showModal() method */}

    </div>


        <div className="flex flex-col">
          <div className="flex flex-col">
            <span className="text-sm m-10 text-white">
              {language === "english"
                ? "Step 1 of 2: Upload Bank Statement"
                : "चरण 1 में से 2: बैंक विवरण अपलोड करें"}
            </span>
            <progress
              className="progress w-[50%] -mt-5 ml-10 bg-white progress-success"
              value={progress}
              max="100"
            ></progress>
            <button
              className="my-5 p-3 flex gap-2 items-center ml-8 bg-[#5BBA9F] w-fit rounded-lg text-white hover:bg-[#4bc9a5]"
              onClick={() => document.getElementById("bank").click()}
            >
              <MdOutlineUploadFile />{" "}
              {language === "english"
                ? "Upload Document"
                : "दस्तावेज़ अपलोड करें"}
            </button>
            <span className="p-3 flex gap-2 -mt-5 items-center ml-6 text-white">
              {language === "english"
                ? "Or drag and drop your file here"
                : "या अपना फ़ाइल यहाँ खींचें और छोड़ें"}
            </span>
            {image && ocrResult === "" && (
              <div className="flex justify-center items-center h-32">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
              </div>
            )}
            {/* {image && (
            <img
              src={image}
              alt="uploaded-image"
              className="self-center w-[8rem] md:w-[4rem]"
            />
          )} */}
          </div>


          <div className="flex flex-col mt-5">
            <span className="text-sm m-10 text-white">
              {language === "english"
                ? "Step 2 of 2: Pitch your product"
                : "चरण 2 में से 2: बिजनेस पिच"}
            </span>


            <progress
              className="progress w-[50%] -mt-5 ml-10 bg-white progress-success"
              value={progress}
              max="100"
            ></progress>
            <button className="my-5 p-3 text-xs flex gap-2 items-center ml-8 bg-[#5BBA9F] w-fit rounded-lg text-white hover:bg-[#4bc9a5]">
              {language === "english" ? "Edit Text" : "पाठ संपादित करें"}
            </button>
            <span className="p-3 text-xs flex gap-2 -mt-5 items-center ml-6 text-white">
              {language === "english"
                ? "We extracted text from your voice. You can edit it below."
                : "हमने आपके आवाज़ से पाठ निकाला। आप इसे नीचे संपादित कर सकते हैं।"}
            </span>
            <div className="flex gap-6">
              <textarea
                className="border border-black rounded-lg p-3 mb-4 w-full h-64"
                placeholder={
                  language === "english"
                    ? "Text will appear here..."
                    : "पिच यहाँ दिखाई जाएगा..."
                }
                value={framedPitch}
              ></textarea>
              <button
  className="bg-[#5BBA9F] p-3 h-fit rounded-lg self-end hover:bg-[#4bc9a5] text-white"
  onClick={handleSustainabilityScoreClick(framedPitch)}
  disabled={calculatingScore} // Disable the button while calculation is in progress
>
  {calculatingScore ? 'Calculating...' : 'Sustainability Score'}
</button>

              <dialog id="sustainability_score_modal" className="modal">
  <div className="modal-box">
    <span className="close" onClick={() => document.getElementById('sustainability_score_modal').close()}>&times;</span>
    <h2>Sustainability Score</h2>
    <p>Score: {score}</p>
    <p>Explanation: {sustainability}</p>
  </div>
</dialog>

            </div>
          </div>
        </div>
      </div>
      <div>


            <div className="bg-white p-3 mx-10 mb-5 rounded-lg my-10 w-[32rem]">
              <span className="font-semibold">
                {language === "english" ? "Your Input:" : "आपका इनपुट:"}
              </span>
              <span className="ml-2">{newMessage}</span>
            </div>
            <div className="bg-white chat mr-10 w-[30rem] mx-auto h-[400px] p-3 break-words overflow-auto">
      {/* Conditional rendering for the loading sign */}
      {sendClicked && messages.length === 0 && (
  <div className="flex justify-center items-center h-32">
    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
  </div>
)}

      {/* Rendering chat messages */}
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat ${message.isUser ? "chat-end" : "chat-start"}`}
        >
          <div className="chat-bubble">
            {message.text}
            {!message.isUser && (
              <GiSpeaker
                size={30}
                onClick={() => handlePlayButtonClick(message.text)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
            <div className="flex justify-between bg-white p-2 relative top-12 w-[90%] gap-2">
              <img src="/scan/sparkle.svg" alt="" />
              <button
                onClick={handleSpeechToText}
                className="w-[10%] focus:outline-none"
              >
                <AiOutlineAudio size={30} color="green" />
              </button>
              <select
                className="w-[20%] focus:outline-none border-none rounded-lg p-3"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {Object.keys(languages).map((key) => (
                  <option key={key} value={key}>
                    {languages[key]}
                  </option>
                ))}
              </select>
              <input
                id="textbox"
                type="text"
                name="textbox"
                className="w-[50%] focus:outline-none border-none rounded-lg p-3"
                placeholder={
                  language === "english"
                    ? "Type your message here..."
                    : "अपना संदेश यहाँ लिखें..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="w-[10%] focus:outline-none"
                onClick={handleChatSubmit}
              >
                <IoMdSend size={30} color="#5BBA9F" />
              </button>
            </div>
      </div>
      <img src="/scan/icon.svg" alt="icon" className="absolute right-4 top-4 w-12 rounded-full" />
      <button
        onClick={toggleLanguage}
        className="absolute right-20 top-4 px-3 py-1 rounded bg-gray-200 text-gray-800 mt-2 font-semibold"
      >
        {language === "english" ? "हिंदी" : "English"}
      </button>
      <div>
    </div>
    </div>
  );
}