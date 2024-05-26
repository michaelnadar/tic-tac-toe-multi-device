import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import  Room  from "./Room";
import io from 'socket.io-client';
import styled from "styled-components";

function Home(){
    const [name, setName] = useState("");   
   const [joined,setJoined] = useState(false);
   const inputRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Trigger the button click when Enter is pressed
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }
  };
  
    if(!joined){

        return (
            <>
            <Container>
            <input style={{padding:20,fontSize:20}} autoFocus ref={inputRef} onKeyDown={handleKeyDown}  type="text" onChange={(e) => {
                    setName(e.target.value);
                }}>
                </input>
                <button ref={buttonRef}  onClick={()=>setJoined(true)}>Join</button>
                </Container>
            </>
        )
    }

    return <Room name={name}/>
        
    
}

export default Home;

const Container = styled.div`
display: flex;
align-items: center;
justify-content: center;
height: 100%;
`