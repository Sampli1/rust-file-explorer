import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Logo from "./utils/Logo";
import Toolbar from "./utils/Toolbar";
import "./App.css";


function sortASCII(a, b) {
  const nameA = a.toUpperCase();
  const nameB = b.toUpperCase(); 
  return nameA < nameB ? -1 : (nameA == nameB ? 0 : 1);
}


function App() {
  const [path, setPath] = useState(["/"]);
  const [file, setFile] = useState([]);
  const [back, setBack] = useState(false);
  const searchRef = useRef();


  const fetchData = async () => {
    let data = await invoke("list_folders", { path });
    if (data) {
      setFile(data.sort((a,b) => sortASCII(a.name, b.name)));
    }
  };


  useEffect(() => {
    fetchData(); 

    const backCount = path.filter(segment => segment === "..").length;
    const forwardCount = path.filter(segment => segment !== "..").length;
    setBack(backCount < forwardCount);
    if (path.length == 1) setBack(false);
  }, [, path]);




  // ! NAVIGATE 

  function navigate(path_new) {
    if (path_new == "..") setPath((prevPath) => [...prevPath, path_new])
    else setPath(path_new);
    searchRef.current.value = '';
  }


  // ! SEARCHING
 
  function search(searchString) {
    invoke("find", { basePath: path, name: searchString })
    .then((data) => {
      setFile(data);
    })
    .catch((err) => {
      console.log(err);
    });
  }



  return (
    <>
      <div className="toolbar">
        <Toolbar navigate={navigate} searchRef={searchRef} search={search} path={path} back={back}/>
      </div>

      <div className="container">
        {(file && file.map((x, k) => 
        <div key={k} className="place" onClick={() => x.extension == "" && navigate(x.path)}>
          <div className="logo"><Logo ext={x.extension}/></div>
          <div className="text">{x.name}</div>
          </div>))}
      </div>
    </>
  );
}

export default App;
