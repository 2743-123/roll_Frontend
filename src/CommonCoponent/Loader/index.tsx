// import { useEffect } from "react"

// import Lottie, {Options} from "react-lottie"
// import animationData from "./loader.json"

// const Loader:React.FC=()=>{
//     const  defaultOptions: Options = {
//         loop: true,
//         autoplay: true,
//         animationData,
//         rendererSetting :{
//             preserveAspectRatio : "xMidYMid slice",
//         },

//     }

//     useEffect(()=>{
//         document.body.classList.add("loading");
//         return()=>{
//             document.body.classList.remove("loading");

//         }
//     },[])

//     return (
//         <div className="loadingPanel d-flex align-items-center lottie">
//             <Lottie options={defaultOptions} height={250} width={250} />
//         </div>
//     )
// }
// export default Loader;

import { useEffect } from "react";
import Lottie, { Options } from "react-lottie";
import animationData from "./loader.json"; // make sure this is a .json file
import "./style.scss";

const Loader: React.FC = () => {
  const defaultOptions: Options = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    document.body.classList.add("loading");
    return () => {
      document.body.classList.remove("loading");
    };
  }, []);

  return (
    <div className="loadingPanel d-flex align-items-center lottie">
      <Lottie options={defaultOptions} height={250} width={250} />
    </div>
  );
};

export default Loader;
