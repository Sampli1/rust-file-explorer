import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Logo from "./utils/Logo";
import Toolbar from "./utils/Toolbar";
import "./App.css";
import { PuffLoader } from "react-spinners";


function sortASCII(a, b) {
  const nameA = a.toUpperCase();
  const nameB = b.toUpperCase(); 
  return nameA < nameB ? -1 : (nameA == nameB ? 0 : 1);
}


function App() {
  const [path, setPath] = useState(["/"]);
  const [file, setFile] = useState([]);
  const [back, setBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef();


  const fetchData = async () => {
    let data = await invoke("list_folders", { path });
    console.log(data)
    if (data.length > 0) setFile(data.sort((a,b) => sortASCII(a.name, b.name)));
    else setFile([]);
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
    if (path_new == "..") setPath((prevPath) => prevPath.slice(0, prevPath.length - 1))
    else setPath(path_new);
    searchRef.current.value = '';
  }


  // ! SEARCHING
 
  function search(searchString) {
    invoke("find", { basePath: path, name: searchString })
    .then((data) => {
      console.log(data);
      if (data.length > 0) setFile(data);
      else setFile([]);
      setLoading(false);
    })
    .catch((err) => {
      console.log(err);
    });
    setLoading(true);
  }


  return (
    <>
      <div className="toolbar">
        <Toolbar navigate={navigate} searchRef={searchRef} search={search} path={path} back={back}/>
      </div>
      <div className="path">
        {path.join("/")}
      </div>
      {!loading && 
      <div className="container">
        {(file.length > 0 ? file.map((x, k) => 
        <div key={k} className="place" onClick={() => x.extension == "" && navigate(x.path)}>
          <div className="logo"><Logo ext={x.extension}/></div>
          <div className="text">{x.name}</div>
          </div>) : <>
            <div>No file</div>
          </>)}
      </div>
      }
      {loading &&<> 
      <div className="loading">
        <PuffLoader color="white" />
      </div>
      </>
      }
    </>
  );
}

export default App;
