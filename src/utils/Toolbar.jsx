import React, { useRef, useState } from "react";
import left from "../assets/left.svg"
import searchSVG from "../assets/search.svg"
import addSVG from "../assets/add.svg"
import { invoke } from "@tauri-apps/api";
import "./Toolbar.css"

export default function Toolbar(props) {
    let {navigate, search, searchRef, path, back} = props;
    const [searchString, setSearchString] = useState("");
    const [newFolderString, setNewFolderString] = useState("");
    const newFolderRef= useRef();
    
    // ! ADD DIR
    function add() {
        if (newFolderString == "") return;
        invoke("create_folder", {basePath: path, name: newFolderString})
        .then((data) => {
            console.log("Creata con successo");
            newFolderRef.current.value = "";        
            navigate(data.path);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    return (
        <>
            {back ? <div className="left">
                <img src={left} onClick={() => navigate("..")}/>
            </div> : <div className="left"></div>}
            <div>
                <div>Search File</div>
                <div className="search">
                    <input type="text" ref={searchRef} onChange={(e) => setSearchString(e.target.value)}></input>
                </div>  
                <div className="h" onClick={() => search(searchString)}>
                    <img src={searchSVG}/> 
                </div>
            </div>
            <div>
                <div>Create Dir</div>
                <div>
                    <input type="text" onChange={(e) => setNewFolderString(e.target.value)} ref={newFolderRef}></input>
                </div>
                <div className="h" onClick={() => add()}>
                    <img src={addSVG}/> 
                </div>
            </div>

        </>

    )
}