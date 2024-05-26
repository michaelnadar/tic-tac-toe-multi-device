import { useEffect, useState ,useRef} from 'react'
import '../App.css' 
import io from 'socket.io-client';
import axios from 'axios';
import styled from 'styled-components';
function checkWinner(matrix) {
  // Check horizontal rows
  for (let i = 0; i < 3; i++) {
      if (matrix[i][0] !== "-" && matrix[i][0] === matrix[i][1] && matrix[i][1] === matrix[i][2]) {
        console.log(matrix[i][0] === matrix[i][1]);
          return matrix[i][0]; // Winner found, return the symbol
      }
  }

  // Check vertical columns
  for (let i = 0; i < 3; i++) {
      if (matrix[0][i] !== "-" && matrix[0][i] === matrix[1][i] && matrix[1][i] === matrix[2][i]) {
          return matrix[0][i]; // Winner found, return the symbol
      }
  }

  // Check main diagonal
  if (matrix[0][0] !== "-" && matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2]) {
      return matrix[0][0]; // Winner found, return the symbol
  }

  // Check counter diagonal
  if (matrix[0][2] !== "-" && matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0]) {
      return matrix[0][2]; // Winner found, return the symbol
  }

  // No winner found
  return null;
}

const handleDraw = (matrix)=>{
  return  matrix.some(row => row.some(cell => cell === "-"));
}

function Room({name}) {
  const colors = [
    "#FF5733", // Vibrant Orange
    "#FFBD33", // Bright Yellow
    "#75FF33", // Lime Green
    "#33FF57", // Spring Green
    "#33FFBD", // Turquoise
    "#3380FF", // Light Blue
    "#5733FF", // Blue-Violet
    "#BD33FF", // Bright Purple
    "#FF33A8", // Hot Pink
    "#FF3358"  // Red-Pink
  ];
  const number = [["-","-","-"],["-","-","-"],["-","-","-"]];
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const [matrix, setMatrix] = useState(number);
  const [preVal,setPreVal] = useState("X");
  const [count,setCount] = useState(0);
  const [draw,setDraw] = useState(false);
  const [winner,setWinner] = useState(false);
  const [winVal,setWinVal] = useState("");
  const [disable,setDisable] = useState(false);
  const [socket,setSocket] = useState(null);
  const [room,setRoom] =useState(null);
  const [loading,setLoading] =useState(true);
  const [resetSocket,setResetSocket] = useState(false);
  const [resetData,setResetData] = useState(false);
  const [location, setLocation] = useState(null);
  const [strangerName,setStrangerName] = useState(null);
  const [myName,setMyName] =useState(null);
  const [strangerCity,setStrangerCity] =useState(null);
  const [chat,setChat] = useState('');
  const [chatArr,setchatArr] = useState([]);
  const scrollRef =useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [remoteMousePosition, setRemoteMousePosition] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [remoteWidth,setRemoteWidth] =useState(null);
 
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
  //  window.addEventListener('resize', adjustScale);
    console.log(windowWidth);
    const single = windowWidth/2.4;
      console.log(single);
      setRemoteWidth(single);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [window.innerWidth]);
  socket?.on('mouse_point_receive',({x,y})=>{
      setRemoteMousePosition({x:x,y:y});
  })

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
  
  const handleChat = (e)=>{
    e.preventDefault();
    console.log(chat);
    if(chat !== ''){
      console.log(chat);
      const random = getRandomColor();
       const msgs = [...chatArr];
       msgs.push({You:{chat,random}});
      setchatArr(msgs);
      socket.emit('chat',{room,chat});
      console.log(chatArr);
      setChat('');
    }
  };
  socket?.on('receiveChat',(chat)=>{
    console.log(chat);
    const random = getRandomColor();

    const msgs = [...chatArr];
    msgs.push({Stranger:{chat,random}});
    setchatArr(msgs);
    console.log(chatArr);
  })
  
  socket?.on('userdisconnected',(data)=>{
    console.log(data,'partner disconnected');
    setResetSocket(true);
    setLoading(true);
    setResetData(true);
    setchatArr([]);
    setChat('');
    setMatrix(number);
    setCount(0);
    setDisable(false);
    setPreVal("X");
    setWinVal("");
    setWinner(false);
    setDraw(false);
  });
  // socket?.on('disconnect',()=>{
  //   console.log(data,'partner disconnected');
  //   setResetSocket(true);
  //   setLoading(true);
  //   setResetData(true);
  //   setchatArr([]);
  //   setChat('');
  //   setMatrix(number);
  //   setCount(0);
  //   setDisable(false);
  //   setPreVal("X");
  //   setWinVal("");
  //   setWinner(false);
  //   setDraw(false);
  // })

  socket?.on('receive',(data)=>{
    //debugger;
    const {preVal,r,c} = data.data;
    console.log(data.data)
    if(matrix[r][c]==="-"){
       setDisable(false);
       console.log(matrix)
       if(preVal === "X"){
         setPreVal("O");
         console.log(preVal)
       }else if(preVal === "O"){
         setPreVal("X");
       }
       console.log(matrix);
       const newMatrix = [...matrix];
       newMatrix[r][c] = preVal;
       setMatrix(newMatrix);
       
       const winner = checkWinner(matrix);
       console.log(winner);
       if (winner) {
        // console.log(`Winner: ${winner}`);
           setWinner(true);
           setWinVal(winner);
           setDraw(false);
           setDisable(true);
       }
       if(!handleDraw(matrix)){
       // console.log('hel',handleDraw);
        setDraw(true);
      }
       
     }else{
       console.log(count);
       console.log(matrix);
       setWinVal("");
       setWinner(false);
       setDraw(false);
        const winner = checkWinner(matrix);
       if (winner) {
        // console.log(`Winner: ${winner}`);
           setWinner(true);
           setWinVal(winner);
           setDraw(false);
           setDisable(true);
       }
       if(!handleDraw(matrix)){
       // console.log('hel',handleDraw);
        setDraw(true);
      }
     }
   });
  socket?.on('doreset',()=>{
    console.log('handlereset');
   
    setMatrix(number);
    setCount(0);
    setDisable(false);
    setPreVal("X");
    setWinVal("");
    setWinner(false);
    setDraw(false);
  })
  
  const handleClick = (r,c) =>{
    console.log(r,c) 
    if(matrix[r][c]==="-"){
      setDisable(true);
      setCount(count=>count+1)
      console.log(count)
      if(preVal === "X"){
        setPreVal("O");
        console.log(preVal)
      }else if(preVal === "O"){
        setPreVal("X");
      }
      console.log(preVal,'hello');
      //setDisable(true)
      //const name = "micheal";
      const data = {
        room,
        preVal,
        r,
        c
      }
      socket.emit('msg',{data});
      // socket.on('receive',(preVal)=>{
        console.log(preVal);

        const newMatrix = [...matrix];
        newMatrix[r][c] = preVal;
        setMatrix(newMatrix)
   //   }); 
     
    }
    

   const winner = checkWinner(matrix);
    if (winner) {
      console.log(`Winner: ${winner}`);
        setWinner(true);
        setWinVal(winner);
        setDraw(false);
        setDisable(true);
    } else {
      console.log("No winner yet.");
    }
    if(!handleDraw(matrix)){
      //console.log('hel',handleDraw);
      setDraw(true);
    }
  }
  const handleReset =()=>{
    if(winner || draw){
     socket?.emit('reset',room);
     setMatrix(number);
     setCount(0);
     setDisable(false);
     setPreVal("X");
     setWinVal("");
     setWinner(false);
     setDraw(false);
   }
  }
  // 192.168.1.104
  //172.20.10.2
  useEffect(()=>{
      var socket = io('http://172.20.10.2:3000');
      setSocket(socket);
      socket.on('connect', () => {
        console.log('connected to server');
     
    });
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`http://ip-api.com/json`);
        setLocation(response.data);
        const city = response?.data?.city;
        socket.emit('name',{name,city});  
        setMyName(name);  
      } catch (err) {
    console.log(err);
    socket.emit('name',{name,city:'no Network'});    
      }
    };
    fetchLocation();
    
      
      socket.on('room',({room,name,city})=>{
        console.log(name,city);
       
        setStrangerName(name);
        setStrangerCity(city);
        setRoom(room);
        setLoading(false);
      });
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    return () => {
      
      socket.disconnect();
      console.log('Disconnected from server');
  };
    },[resetSocket]);
    useEffect(()=>{
        setResetSocket(false);
    // setResetData(false);
    },[socket]);
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        // Trigger the button click when Enter is pressed
        if (buttonRef.current) {
          buttonRef.current.click();
        }
      }
    };
   useEffect(()=>{
  scrollRef.current?.scrollIntoView({ behavior: "smooth" });
 },[chatArr]);
 const handleMouseMove = (event) => {
  setMousePosition({ x: event.clientX, y: event.clientY });
  
    if(mousePosition.x !==0 &&mousePosition.y !== 0){
    //  console.log(mousePosition);
      const x= mousePosition.x;
      const y= mousePosition.y;
  
      socket?.emit('mouse',{x,y,room});
    }
  
};

const handleMouseDown = (event) => {
  setClickPosition({ x: event.clientX, y: event.clientY });
  console.log(clickPosition);
};

  return (
    <>
    {
    RemoteCursor && <RemoteCursor
          
          style={{
            left: `${remoteMousePosition?.x+remoteWidth+1}px`,
            top: `${remoteMousePosition?.y}px`,
          }}
        >
      {strangerName}
</RemoteCursor>
        }
    {loading ? <div style={{color:'green'}}>'Looking for Partner.........'
    {resetData && <div style={{color:'red'}}> partner got disconnect!!!! Again Looking for partner</div>}
    </div>:
    ( <>
      <Container 
      >
        

      
      <Tic 
       onMouseMove={handleMouseMove}
       onMouseDown={handleMouseDown}
      >
        
      
      <div style={{color:'red'}}>Stranger's Name:{strangerName}</div>
      <div style={{color:'red'}}>Stranger's Location:{strangerCity}</div>
    
        <div style={{marginTop:30}}>
        <button onClick={handleReset}>Reset</button>
     </div>
     <div style={{marginTop:30,fontSize:30}}>
     {winner ? `Winner ${winVal}`:''}
     </div>
     
     {matrix.map((row,rowIndex) =>(
       <div key={rowIndex}>
        {row.map(
          (Element,colIndex) => (<button style={{color:'red'}} disabled={disable} key={colIndex} onClick={(e)=>handleClick(rowIndex,colIndex,e)}>{Element}</button>)
        )}
        </div>
      ))}
     {!winner ?(<div style={{marginTop:30,fontSize:30,color:'green'}}>
      {draw ? `Draw ` : `Player ${preVal} Turn` }
      
      </div>
    ):''}
    
    </Tic>
    <VerticalLine />
     <Tic 
     disabled={true}
     >
    <div >
      
      <div style={{color:'red'}}>Stranger's Name:{myName}</div>
      <div style={{color:'red'}}>Stranger's Location:{location?.city}</div>
    
        <div style={{marginTop:30}}>
        <button disabled={true} style={{color:'white'}} onClick={handleReset}>Reset</button>
     </div>
     <div style={{marginTop:30,fontSize:30}}>
     {winner ? `Winner ${winVal}`:''}
     </div>
     
     {matrix.map((row,rowIndex) =>(
       <div key={rowIndex}>
        {row.map(
          (Element,colIndex) => (<button style={{color:'red'}} disabled={true} key={colIndex} onClick={(e)=>handleClick(rowIndex,colIndex,e)}>{Element}</button>)
        )}
        </div>
      ))}
     {!winner ?(<div style={{marginTop:30,fontSize:30,color:'green'}}>
      {draw ? `Draw ` : `Player ${preVal} Turn` }
      
      </div>
    ):''}
      </div>    
    
    </Tic>
    <VerticalLine />
    <ChatContainer >
   
               <Scroll>
       {chatArr.map((val,index)=>
      <Chat ref={scrollRef} key={index} style={{color:`${val?.Stranger?val?.Stranger.random:val?.You.random}`}}>
        {val?.Stranger? `Stranger:${val?.Stranger.chat}`:`You:${val?.You.chat}`}
       </Chat>
       )}
     </Scroll>
     <div style={{display:'flex',gap:5}}>
     <input autoFocus  ref={inputRef}
        type="text"
        style={{width:'100%',fontSize:16}}
        onKeyDown={handleKeyDown} value={chat} onChange={(e) => {
                   setChat(e.target.value);
               }}>
               </input>
               <button ref={buttonRef} style={{color:'red',padding:0}} onClick={(e)=>handleChat(e)}>Send</button>
               </div>
   </ChatContainer>
    </Container>
      </>
    )
    }
    
    </>
  )
}

export default Room

const ChatContainer = styled.div`
  display:flex;
  flex:0.4;
  flex-shrink: 0.4;
  justify-content:end;
  flex-direction:column;
  height:100%;
`

const VerticalLine = styled.div`
  width: 1px; /* Thickness of the line */
  height: 100%; /* Height of the line */
  background-color: black; /* Color of the line */
  // margin: 0 10px; /* Optional: Spacing around the line */
`;

const RemoteCursor = styled.div`
  position: absolute;
  white-space: nowrap; 
  width: 88px;
  height: 88px;
  font-size:17px;
  background: url('/icons8-cursor.svg') no-repeat center center;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
`;


const Chat = styled.div`
white-space: normal;
font-size:14px;
text-align:left;
overflow-wrap: break-word;
word-break: break-all;
overflow: hidden;
`

const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
};

const Tic = styled.div`
  flex:1;
  
  @media (max-width: ${breakpoints.mobile}) {
      margin-left:0px;
  }
`

const Container = styled.div`
  height: 100%;
  width: 100%;
 
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Scroll = styled.div`
 
  overflow:auto;
  /* Custom scrollbar styles for WebKit browsers */
  &::-webkit-scrollbar {
    width: 12px; /* Width of the vertical scrollbar */
    height: 12px; /* Height of the horizontal scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: #242424; /* Background of the scrollbar track */
    border-radius: 6px; /* Optional: rounded corners for the track */
  }

  &::-webkit-scrollbar-thumb {
    background-color:black; /* Color of the scrollbar thumb */
    border-radius: 6px; /* Optional: rounded corners for the thumb */
    border: 3px solid orange; /* Creates padding around thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555; /* Color of the thumb when hovered */
  }

`
