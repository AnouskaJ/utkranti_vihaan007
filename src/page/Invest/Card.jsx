import React from "react";
import { NavLink } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";


const Card = ({ image,name, location, distance, phrase, cost , id, summary }) => {
  return (
    <NavLink to={"/test/"+id}>
    <div className="bg-[#78abe8] rounded-lg shadow-lg overflow-hidden w-[60rem]  my-4 flex">
      <img src={image} alt={name} className="w-[18rem] object-cover p-2 rounded-3xl" />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-red-500">{name}</h2>
        <div className="flex items-center mb-2 gap-1">
        <FaRegUser color="black"/> 

          <p className="text-black"> {location}</p>
        </div>
        <p className="text-lg font-bold text-gray-800">Loan needed: Rs {cost}</p>
        <p className="text-sm font-mono font-semibold text-gray-800 tracking-tight">summary: {summary}</p>
      </div>
    </div></NavLink>
  );
};

export default Card;
