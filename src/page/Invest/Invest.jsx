import React, { useEffect, useState } from "react";
import Card from "./Card";
import axios from "axios";
import Tests from "./test";
import { MdFilterAlt, MdArrowBack } from "react-icons/md";


export default function Invest() {
  // State to store the value of the range slider
  const [sliderValue, setSliderValue] = useState(6000);
  const [botResponse, setBotResponse] = useState("");
  // State to store the selected location
  const [selectedLocation, setSelectedLocation] = useState("");
  // State to store the search input value
  const [searchTerm, setSearchTerm] = useState("");
  // State to control the visibility of filter components
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [query, setQuery] = useState("");

  const [selectedTests, setSelectedTests] = useState([]);

  const goBack = () => {
    window.history.back(); // Navigate back to the previous page
  };


  const handleCheckboxChange = (event) => {
    const { checked, value } = event.target;
    if (checked) {
      setSelectedTests((prevSelectedTests) => [...prevSelectedTests, value]);
    } else {
      setSelectedTests((prevSelectedTests) =>
        prevSelectedTests.filter((test) => test !== value)
      );
    }
    console.log("Selected tests:", selectedTests);
  };

  const cardData = Tests;

  // Function to handle changes in the range slider value
  const handleSliderChange = (event) => {
    setSliderValue(parseInt(event.target.value));
  };

  // Function to handle changes in the selected location
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  // Function to handle changes in the search input value
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Function to toggle the visibility of filter components
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  const fetchData = async (query, setBotResponse) => {
    try {
      const response = await axios.post("http://localhost:5000/test", {
        prompt_2: query,
      });
      const responseData = response.data;
      const botResponseData = responseData.result;
      setBotResponse(botResponseData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchData(query, setBotResponse);
  }, []); // Empty dependency array to execute only once when component mounts

  useEffect(() => {
    console.log(botResponse);
  }, [botResponse]);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");
  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() !== "") {
      const newPosition = messages.length % 2 === 0 ? "end" : "start";
      setMessages([...messages, { text: newMessage, position: newPosition }]);
      setNewMessage("");
  
      try {
        const response = await axios.post("http://localhost:5000/test", {
          prompt_2: newMessage,
        });
        const responseData = response.data;
        const botResponseData = responseData.result;
        setBotResponse(botResponseData);
  
        if (responseData.test_details && responseData.test_details.length > 0) {
          const newFilteredCardData = Tests.filter((test) => {
            return responseData.test_details.some(
              (detail) => detail.test_name === test.test_name
            );
          });
          setFilteredCardData(newFilteredCardData);
          setTestDetails(responseData.test_details[0]); 
        } else {
          setFilteredCardData([]);
          setTestDetails(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };  
  

  // useEffect(() => {
  //   console.log(botResponse);
  // }, [botResponse]);



  

  // Language toggle state
  const [isEnglish, setIsEnglish] = useState(false);

  // Function to toggle between English and Hindi
  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  return (
    <>
      <div className="bg-[#0e3a6e] flex text-white">
        <div
          className={`border-dashed border-r border-black w-[30%] h-screen md:flex hidden flex-col items-center gap-6 my-10 over ${
            isFilterVisible ? "block" : "hidden"
          }`}
        >
          <div className="flex justify-center">
            <MdFilterAlt size={64}/>
          </div>
          <div className="bg-[#78abe8] rounded-md flex h-[6rem] flex-col mt-10">
            <h1 className="flex justify-center font-semibold">Loan</h1>
            <div className="mt-1 max-w-xl mx-auto w-60 px-6">
              <input
                id="range"
                type="range"
                className="block w-full py-2 text-gray-700 bg-white border border-gray-300 rounded-md"
                value={sliderValue}
                onChange={handleSliderChange}
                min={3000} // set min value
                max={50000} // set max value
              />
              <div className="flex justify-between text-xs -mt-2">
                <span>₹ 3000</span>
                <span>₹ 50000</span>
              </div>
            </div>
          </div>
          <div className="bg-[#78abe8] rounded-md flex flex-col h-[6rem] w-60">
            <h1 className="flex justify-center h-8 font-semibold">Location</h1>
            <div className="mt-1 max-w-xl pb-2 mx-auto w-[13rem] h-[3rem] px-6 text-xs">
              <select
                id="location"
                value={selectedLocation}
                onChange={handleLocationChange}
                className="block w-full py-1 text-gray-700 bg-[#E1F9F5] border border-gray-300 rounded-md"
              >
                <option value="">Select location</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>
          </div>
          <div className="bg-[#78abe8] rounded-md flex flex-col h-auto w-60 p-4">
          <h1 className="flex justify-center font-semibold h-8">
  {isEnglish ? "Startup Theme" : "स्टार्टअप थीम"}
</h1>
<div className="mt-4">
  <input
    type="checkbox"
    id="theme1"
    name="theme1"
    value="Food Delivery"
    onChange={handleCheckboxChange}
  />
  <label htmlFor="theme1">
    {isEnglish ? "Food Delivery" : "भोजन वितरण"}
  </label>
  <br />

  <input
    type="checkbox"
    id="theme2"
    name="theme2"
    value="Dairy Products"
    onChange={handleCheckboxChange}
  />
  <label htmlFor="theme2">
    {isEnglish ? "Dairy Products" : "डेयरी उत्पाद"}
  </label>
  <br />

  <input
    type="checkbox"
    id="theme3"
    name="theme3"
    value="Solar Energy"
    onChange={handleCheckboxChange}
  />
  <label htmlFor="theme3">
    {isEnglish ? "Solar Energy" : "सौर ऊर्जा"}
  </label>
  <br />

  <input
    type="checkbox"
    id="theme4"
    name="theme4"
    value="Poultry Farming"
    onChange={handleCheckboxChange}
  />
  <label htmlFor="theme4">
    {isEnglish ? "Poultry Farming" : "पोल्ट्री उत्पादन"}
  </label>
  <br />
</div>
          </div>
        </div>
        <div className="flex flex-col mx-auto">
          <div className="self-center">
            <form className="flex justify-center">
              <input
                className="peer w-40 p-2 rounded-md outline-none text-sm text-gray-700 pr-2 m-4"
                type="text"
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={isEnglish ? "Search something.." : "कुछ खोजें..."}
              />
            </form>
            <div className="container mx-auto mt-10 flex justify-around px-2 md:gap-x-4 flex-wrap">
              {cardData
                .filter(
                  (card) => parseInt(card.loan) <= sliderValue // Filter cards based on the slider value
                )
                .filter((card) => {
                  // Filter cards based on the search input value
                  const searchTermLower = searchTerm.toLowerCase();
                  return (
                    card.company_name?.toLowerCase().includes(searchTermLower)
                  );
                })
                .filter((card) => {
                  // Filter cards based on the selected tests
                  return (
                    selectedTests.length === 0 ||
                    Object.values(card).some((value) => {
                      if (Array.isArray(value)) {
                        return value.some((test) =>
                          selectedTests.includes(test)
                        );
                      } else {
                        return selectedTests.includes(value);
                      }
                    })
                  );
                })

                .map((card, index) => (
                  <Card
                    key={index}
                    image={card.image_link}
                    name={card.company_name}
                    location={card.name}
                    // distance={card.distance}
                    // phrase={card.phrase}
                    id={card.test_id}
                    cost={card.loan}
                    summary={card.Summary}
                  />
                ))}
              {console.log("Card:", Card)}
            </div>
          </div>
        </div>
        

        {/* Toggle Chat Visibility Button */}
        
      </div>
      <button
        onClick={goBack}
        className="absolute top-4 left-4"
      >
        <MdArrowBack size={40} />
      </button>
      <button
        onClick={toggleLanguage}
        className="absolute right-20 top-4 px-3 py-1 rounded bg-gray-200 text-gray-800 mt-2 font-semibold"
      >
        {isEnglish === true ? "हिंदी" : "English"}
      </button>
    </>
  );
}