import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Home.css";
import background from "../../../public/home/bg.png";

export default function Home() {
  const [language, setLanguage] = useState("english");

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "hindi" : "english");
  };

  return (
    <div
      className="w-screen h-screen py-10 flex-col"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-gray-200 rounded-md font-semibold"
        >
          {language === "english" ? "हिंदी" : "English"}
        </button>
      </div>
      <div className="mx-auto w-[60%] bg-white h-[55px] rounded-lg flex justify-between items-center px-4">
        <span className="text-3xl text-red-500 font-bold">
          {language === "english" ? (
            <>
              U<span className="text-lg font-mono">t</span>
              <span className="text-lg font-mono text-[#0e3a6e]">kra</span>
              <span className="text-lg font-mono text-[#f8b92a]">nti</span>
            </>
          ) : (
            "उत्क्रांति"
          )}
        </span>
        <button className="text-red-500 font-semibold py-1 text-[20px] border-[1px] border-[#003585] px-7 rounded-xl hover:bg-[#f8b92a]">
          {language === "english" ? "Login" : "लॉग इन"}
        </button>
      </div>
      <div className="text-5xl text-white mt-[12%] mx-auto w-[60%] flex flex-col gap-y-5">
        <p className="text-base font-mono">
          {language === "english"
            ? "Streamlined and Fortified Payment Process"
            : "संयमित और मजबूत भुगतान प्रक्रिया"}
        </p>
        <p className="w-[80%]">
          {language === "english"
            ? "Empowering Your Loan Requirements."
            : "आपकी ऋण आवश्यकताओं को मजबूत बनाना।"}
        </p>
        <div className="flex gap-x-16 mt-5">
          {/* Use Link component to link to "/pitch" page */}
          <Link to="/pitch" className="text-white font-medium py-4 text-[15px] border-[1px] px-7 rounded-lg bg-blue-600 border-none hover:bg-blue-400">
            {language === "english"
              ? "Pitch Your Idea"
              : "अपना विचार प्रस्तुत करें"}
          </Link>
          <Link to="/invest" className="text-white font-medium py-4 text-[15px] border-[1px] px-7 rounded-lg bg-blue-600 border-none hover:bg-blue-400">
            {language === "english"
              ? "Invest in an Idea"
              : "एक विचार में निवेश करें"}
          </Link>
        </div>
      </div>
    </div>
  );
}
