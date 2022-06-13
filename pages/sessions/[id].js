import React, { useState, useEffect } from 'react';
import Head from 'next/head';
//Authentication
import { useSession } from 'next-auth/react';
//Firebase
import { db } from '../../firebase/firebaseConfig';
import * as fs from 'firebase/firestore';
import { useRouter } from 'next/router';
//Icons
import {
  AdjustmentsIcon,
  PlayIcon,
  ShareIcon,
  CogIcon,
  LogoutIcon,
  XCircleIcon
} from '@heroicons/react/solid';
import { theme } from '../../tailwind.config';
//Components
import Header from '../../components/Header';
import SignIn from '../others/SignIn';
import NotiPopup from '../../components/NotiPopup';
import SessionError from '../../components/SessionError';

function Session() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  //States related
  const [adminId, setAdminId] = useState();
  const currentJoinedTime = Date.now();
  const [latestTimeJoined, setLatestTimeJoined] = useState();
  const [isTimeAdjusted, setTime] = useState(false);
  const [isSessionStarted, setSessionStarted] = useState(false);
  const [isSessionEnded, setSessionEnded] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionPrivacy, setSessionPrivacy] = useState("");

  //Popups-related
  const [isAdjustTimeClicked, setAdjustTimeClicked] = useState(false); //Radius buttons popup
  const [isStartSessionClicked, setStartSessionClicked] = useState(false); //Noti popup
  const [isExitClicked, setExitClicked] = useState(false); //Noti popup
  const [isSessionConfigClicked, setSessionConfigClicked] = useState(false); //Multi options popup
  const [isInviteFriendsClicked, setInviteFriendsClicked] = useState(false); //Text copy popup

  //Main funcs & variables
  function useRadioButtons(name) {
    const [value, setState] = useState(null);
  
    const handleChange = e => {
      setState(e.target.value);
    };
  
    const inputProps = {
      name,
      type: "radio",
      onChange: handleChange
    };
  
    return [value, inputProps];
  }

  const[timeValue, timeInputProps] = useRadioButtons();

  function navigateToHome() {
    router.push("/"); 
  }

  //Counter related
  const [timeCounter, setTimeCounter] = useState(0);
  const [timeCounterLocal, setTimeCounterLocal] = useState(0);
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  function updateTime() {
    fs.updateDoc(docRef, "time", parseInt(timeValue));
  }

  function convertTimer(time) {
    var min = Math.floor(time / 60);
    var sec = time % 60;
    min < 10 ? setMinutes("0" + min) : setMinutes(min);
    sec < 10 ? setSeconds("0" + sec) : setSeconds(sec);
  }

  function updateTimer(time) {
    convertTimer(time);
  }

  useEffect(() => {
    setTimeCounterLocal(timeCounter);
    updateTimer(timeCounter);
  }, [timeCounter]);

  useEffect(() => {
    if (isSessionStarted) {
      setInterval(controlCountDown, 1000);
    }
  }, [isSessionStarted]);

  function controlCountDown() {
    if (timeCounterLocal != 0) {
      setTimeCounterLocal(timeCounterLocal--);
      convertTimer(timeCounterLocal);
    }
    endSession();
  }
  function startSession() {
    if (timeCounterLocal != 0) {
      fs.updateDoc(docRef, "isSessionStarted", true);
      fs.updateDoc(docRef, "startedTime", Date.now());
    }     
  }
  function endSession() {
    if (timeCounterLocal === 0) {
      fs.updateDoc(docRef, "isSessionEnded", true);
    }
  }

  //Initialize realtime data from Firestore
  const sessionId = router.asPath.replace("/sessions/", "");
  const docRef = fs.doc(db, "fkSessions", sessionId);
  
  fs.onSnapshot(docRef, (doc) => {
    setSessionName(doc.get("name"));
    setSessionPrivacy(doc.get("privacy"));
    setTimeCounter(doc.get("time"));
    setSessionStarted(doc.get("isSessionStarted"));
    setSessionEnded(doc.get("isSessionEnded"));
  });

  //Get session admin id
  const usersJoinedColRef = fs.collection(docRef, "usersJoined");
  const q = fs.query(usersJoinedColRef, fs.where("isAdmin", "==", true));
  const querySnapshot = fs.getDocs(q)
  querySnapshot.then((query) => {
    query.forEach((doc) => {
      setAdminId(doc.id);
    });
  });

  //Add non-admin user to session
  if (session?.user.id != null && adminId != null) {
    const userJoinedDocRef = fs.doc(usersJoinedColRef, session?.user.id);
    if (session?.user.id != adminId) {
      fs.setDoc(
          userJoinedDocRef,
          {
              id: session?.user.id,
              isAdmin: false,
              hasCompleted: false,
              timeCompleted: "",
              latestTimeJoined: currentJoinedTime
          }
      );
    }
    else {
      fs.updateDoc(userJoinedDocRef, "latestTimeJoined", currentJoinedTime);
    }
  }

  function displaySession() {
    return(
      <>
        {
          sessionPrivacy === "private" ?
          <Header headerText={'Session: ' + sessionName + ' 🔒'}>
          </Header>
          :
          <Header headerText={'Session: ' + sessionName + ' 🌎' + latestTimeJoined}>
          </Header>
        }

        <div className='relative mt-[20px] w-[90%] h-[80%] mx-auto'>
          <div className='absolute w-full h-[75%]'>
            <div className='absolute h-full w-[49%] bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)]'>

            </div>

            <div className='absolute right-0 h-full w-[49%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)]'>
            {
              session?.user.id === adminId ?
              <div className='absolute w-[80%] h-[80%]'>
                <div className='absolute w-full h-[50%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)]'>
                  <h1 className='font-poppins font-semibold text-8xl text-[#8E8EC8] select-none truncate ...'>
                  {minutes + " : " + seconds}
                  </h1>
                </div>

                <div className='absolute bottom-0 w-full h-[50%] flex items-center justify-center'>
                  <div className='absolute w-full h-[40%]'>
                    <div className='absolute h-full w-[49%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] hover:cursor-pointer hover:bg-purple_light' onClick={() => setAdjustTimeClicked(true)}>
                      <div className='absolute h-[40px] w-[90%]'>
                        <div className='absolute h-full w-[40px]'>
                          <AdjustmentsIcon className='absolute w-full h-full scale-[60%] overflow-auto' style={{color: theme.extend.colors.purple}}>
                          </AdjustmentsIcon>
                        </div>

                        <div className='absolute right-0 h-full w-[80%] flex items-center justify-center'>
                          <h1 className='font-poppins font-medium text-[10.5pt] text-[#8E8EC8] truncate ... select-none'>
                            Adjust Session Time
                          </h1>
                        </div>
                      </div>
                    </div>

                    <div className='absolute right-0 h-full w-[49%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] hover:cursor-pointer hover:bg-purple_light'
                    onClick={() => 
                      {
                        startSession();
                      }
                    }
                    >
                      <div className='absolute h-[40px] w-[90%]'>
                          <div className='absolute h-full w-[40px]'>
                            <PlayIcon className='absolute w-full h-full scale-[60%] overflow-auto' style={{color: theme.extend.colors.purple}}>
                            </PlayIcon>
                          </div>

                          <div className='absolute right-0 h-full w-[80%] flex items-center justify-center'>
                            <h1 className='font-poppins font-medium text-[10.5pt] text-[#8E8EC8] truncate ... select-none'>
                              Start This Session
                            </h1>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              :
              <div className='absolute w-[80%] h-[80%]'>
                <div className='absolute w-full h-full flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)]'>
                  <h1 className='font-poppins font-semibold text-8xl text-[#8E8EC8] select-none truncate ...'>
                    {minutes + " : " + seconds}
                  </h1>
                </div>
              </div>
            }
            </div>            
          </div>

          <div className='absolute bottom-0 w-full h-[20%] flex items-center justify-center'>
            <div className='absolute w-[80%] h-[55%]'>
              <div className='absolute h-full w-[30%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] hover:cursor-pointer hover:bg-purple_light'>
                <div className='absolute h-[40px] w-[90%]'>
                  <div className='absolute h-full w-[40px]'>
                    <ShareIcon className='absolute w-full h-full scale-[60%] overflow-auto' style={{color: theme.extend.colors.purple}}>
                    </ShareIcon>
                  </div>

                  <div className='absolute right-0 h-full w-[80%] flex items-center justify-center'>
                    <h1 className='font-poppins font-medium text-[10.5pt] text-[#8E8EC8] truncate ... select-none'>
                      Invite Your Friends To Join
                    </h1>
                  </div>
                </div>
              </div>

              <div className='absolute left-[35%] h-full w-[30%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] hover:cursor-pointer hover:bg-purple_light'>
                <div className='absolute h-[40px] w-[90%]'>
                  <div className='absolute h-full w-[40px]'>
                    <CogIcon className='absolute w-full h-full scale-[60%] overflow-auto' style={{color: theme.extend.colors.purple}}>
                    </CogIcon>
                  </div>

                  <div className='absolute right-0 h-full w-[80%] flex items-center justify-center'>
                    <h1 className='font-poppins font-medium text-[10.5pt] text-[#8E8EC8] truncate ... select-none'>
                      Session Configuration
                    </h1>
                  </div>
                </div>
              </div>

              <div className='absolute right-0 h-full w-[30%] flex items-center justify-center bg-white rounded-[15px] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] hover:cursor-pointer hover:bg-purple_light'>
                <div className='absolute h-[40px] w-[90%]'>
                  <div className='absolute h-full w-[40px]'>
                    <LogoutIcon className='absolute w-full h-full scale-[60%] overflow-auto' style={{color: '#FA3E3E'}}>
                    </LogoutIcon>
                  </div>

                  <div className='absolute right-0 h-full w-[80%] flex items-center justify-center'>
                    <h1 className='font-poppins font-medium text-[10.5pt] text-[#FA3E3E] truncate ... select-none'>
                      Exit Or Give Up This Session
                    </h1>
                  </div>
                </div>
              </div>                              
            </div>
          </div>

          {/* Popups area */}

          {/* Adjust Time popup */}
          {
            isAdjustTimeClicked ==  true ?
            <div className='relative flex items-center justify-center h-full w-full'>
              <div className='absolute w-[60%] h-[85%] drop-shadow-[0_10px_60px_rgba(226,236,249,1)] bg-white rounded-[15px]'>
                <div className='h-[15%] w-full flex items-center justify-center font-poppins text-xm font-medium select-none'>
                    Adjust Session Time

                    <div className='absolute right-[15px] h-[40px] w-[40px] hover:cursor-pointer' style={{color: theme.extend.colors.purple}} onMouseOver={({target})=>target.style.color=theme.extend.colors.purple_2} onMouseOut={({target})=>target.style.color=theme.extend.colors.purple}
                    onClick={() => setAdjustTimeClicked(false)}
                    >
                        <XCircleIcon></XCircleIcon>
                    </div>                                  
                </div>

                <div className='relative h-[70%] w-[90%] mx-auto flex items-center justify-center'>
                  <div className='h-[70%] w-[90%]'>
                      <div className='h-full w-full'>
                          <form className='relative w-full h-full'>
                              <label for="time" class="block mb-2 text-sm font-poppins font-medium select-none truncate ...">{"Choose the amount of time (10s is just for demo only)"}</label>

                              <div class="w-full h-full flex items-center justify-center">
                                  <div class="absolute left-0 form-check form-check-inline">
                                      <input class="form-check-input appearance-none rounded-full h-5 w-5 border-2 border-gray-300 bg-white checked:bg-purple checked:border-gray-300 checked:border-[3px] transition mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="timeRadioOptions" id="time1" value="10" checked={timeValue === "10"} {...timeInputProps}/>
                                      <label class="form-check-label inline-block text-sm font-poppins select-none" for="inlineRadio10">10 secs</label>
                                  </div>

                                  <div class="absolute left-[28%] form-check form-check-inline">
                                      <input class="form-check-input appearance-none rounded-full h-5 w-5 border-2 border-gray-300 bg-white checked:bg-purple checked:border-gray-300 checked:border-[3px] transition mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="timeRadioOptions" id="time2" value="1800" checked={timeValue === "1800"} {...timeInputProps}/>
                                      <label class="form-check-label inline-block text-sm font-poppins select-none" for="inlineRadio20">30 mins</label>
                                  </div>

                                  <div class="absolute right-[28%] form-check form-check-inline">
                                      <input class="form-check-input appearance-none rounded-full h-5 w-5 border-2 border-gray-300 bg-white checked:bg-purple checked:border-gray-300 checked:border-[3px] transition mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="timeRadioOptions" id="time3" value="2700" checked={timeValue === "2700"} {...timeInputProps}/>
                                      <label class="form-check-label inline-block text-sm font-poppins select-none" for="inlineRadio20">45 mins</label>
                                  </div>

                                  <div class="absolute right-0 form-check form-check-inline">
                                      <input class="form-check-input appearance-none rounded-full h-5 w-5 border-2 border-gray-300 bg-white checked:bg-purple checked:border-gray-300 checked:border-[3px] transition mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="timeRadioOptions" id="time3" value="3600" checked={timeValue === "3600"} {...timeInputProps}/>
                                      <label class="form-check-label inline-block text-sm font-poppins select-none" for="inlineRadio20">60 mins</label>
                                  </div>                                                                     
                              </div>                                            
                          </form>                                        
                      </div>
                  </div>
                </div>

                <div className='relative h-[15%] w-[90%] mx-auto flex items-center justify-center'>
                {
                    timeValue === null ?
                    <button type="button" class="absolute flex items-center justify-center right-0 w-[25%] h-[60%] bg-purple opacity-30 rounded-[15px] font-poppins text-sm text-white font-medium select-none" disabled>
                        Set Time
                    </button>
                    :
                    <button type="button" class="absolute flex items-center justify-center right-0 w-[25%] h-[60%] bg-purple rounded-[15px] font-poppins text-sm text-white font-medium hover:bg-purple_2 hover:cursor-pointer select-none"
                    onClick={() => {
                          setTime(true);
                          updateTime(timeValue);
                          setAdjustTimeClicked(false);  
                        }
                    }>
                        Set Time
                    </button>                                  
                }
                </div> 
              </div>                 
            </div>
            : null
          }

          {/* Confirm completed session popup */}
          {
            isSessionEnded === true ?
            <NotiPopup 
              haveExitButton={false}
              notiTitle="Congratulations"
              buttonTitle="I have completed"
              notiInfo="Hi there! Congratulation, you have completed this session. 
              Thanks for your great efforts and please keep going, never give up! Please do not leave this site, 
              reload it or navigate to any other pages without comfirming that you have completed this session, because
              this achievement won't be included for you. So now please click the button below to confirm it
              as soon as possible. You will be navigated to the home page soon to begin with another one. Thank you!"
              extraFunction={navigateToHome}
            >
            </NotiPopup>
            :
            null   
          }        
        </div>   
      </>      
    );
  }

  if (status === "loading") {
    return(null)
  }

  if (status === "authenticated") {
    return (
      (session?.user.id === adminId) || (session?.user.id != adminId && sessionPrivacy === "public") ?
      displaySession()
      :
      <SessionError></SessionError>
    );
  }

  return(
    <div>
      <Head>
          <title>Fokus | Sign In</title>
          <link rel="icon" href="/favicon.ico" />
      </Head>

      <SignIn></SignIn>
    </div>
  );
}

export default Session