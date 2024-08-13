import React from "react";
import FolderSVG from "../assets/folder.svg"; 
import "./Logo.css"

export default function Logo(props) {
  return (
    <>
      {props.ext === "" ? (
        <img src={FolderSVG}/>     
    ) : (
        <div className="logo_fake">{props.ext}</div>
      )}
    </>
  );
}
