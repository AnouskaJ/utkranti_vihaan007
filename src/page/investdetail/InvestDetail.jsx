import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { GiSpeaker } from "react-icons/gi";
import { IoMdSend } from "react-icons/io";
import { AiOutlineAudio } from "react-icons/ai";
import axios from "axios";

const InvestDetail = () => {
  const { id } = useParams();
  // Assuming the data is fetched from an API using the ID
  const data = {
    test_id: 104,
    company_name: "GreenHarvest",
    loan: 20000,
    image_link:
      "https://www.shutterstock.com/image-photo/organic-vegetables-on-wood-background-260nw-389222113.jpg",
    name: "Priya",
    Summary:
      "GreenHarvest promotes sustainable agriculture in rural India through organic farming practices. Our farmers cultivate pesticide-free crops, preserving soil health and biodiversity. Join us in nurturing the land and producing healthy, eco-friendly food with GreenHarvest.",
  };

  const goBack = () => {
    window.history.back(); // Navigate back to the previous page
  };

  // OCR component variables
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [added, setAdded] = useState(false);

  // Fetch languages from API
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

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() !== "") {
      try {
        let response;
        if (selectedLanguage === "eng_Latn") {
          response = await axios.post("http://localhost:5000/query", {
            ocr: ocrResult,
            prompt: newMessage,
          });
        } else {
          response = await axios.post(
            "http://localhost:5000/translated_query",
            {
              ocr: ocrResult,
              prompt: newMessage,
              src_lang: selectedLanguage,
            }
          );
        }

        const answer = response.data.answer;
        setMessages([...messages, { text: newMessage, isUser: true }]);
        setMessages([...messages, { text: answer, isUser: false }]);
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
        console.error("Error sending chat message:", error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#78abe8]">
      {/* Displaying the details on the left side */}
      <div className="bg-[#0e3a6e] w-[60%] h-full p-5">
        <button onClick={goBack} className="text-white hover:text-gray-300">
          <MdArrowBack size={40} />
        </button>
        <div className="flex flex-col items-center">
          <img src={data.image_link} alt="Company" className="w-48 h-48 rounded-full mb-4" />
          <h1 className="text-3xl text-white font-semibold">{data.company_name}</h1>
          <h2 className="text-lg text-white">{data.name}</h2>
          <p className="text-white mt-4">{data.Summary}</p>
          <div className="bg-white p-3 mt-4 rounded-lg">
            <span className="font-semibold">Loan:</span>
            <span className="ml-2">{data.loan}</span>
          </div>
          <div className="absolute bottom-3 left-3">
            <button className="flex items-center justify-center bg-[#5BBA9F] text-white px-4 py-2 rounded-lg hover:bg-[#4bc9a5]">
              <FaShoppingCart className="mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot interface on the right side */}
      <div className="bg-white w-[40%] h-full py-6">
        {/* Chatbot content can be added here */}
        <div>
        <div className="bg-white p-3 mx-10 rounded-lg">
          <span className="font-semibold">
            {language === "english" ? "Your Input:" : "आपका इनपुट:"}
          </span>
          <span className="ml-2">{newMessage}</span>
        </div>
        <div className="bg-white chat mr-10 w-[30rem] mx-auto p-3 break-words overflow-auto">
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
        <div className="flex justify-between bg-white p-2 absolute top-[90%] w-[38%] gap-2">
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
      </div>
    </div>
  );
};

export default InvestDetail;
