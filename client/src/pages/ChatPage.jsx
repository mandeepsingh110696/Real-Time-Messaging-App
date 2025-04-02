import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const sendIcon = (
	<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M19 10L1 1L5 10L1 19L19 10Z' stroke='black' strokeWidth='2' strokeLinejoin='round' />
	</svg>
);


export const ChatPage = () => {
	const navigate = useNavigate();
	const { name } = useParams();
	const [messages, setMessages] = useState([]);
	const [sendMessages, setSendMessages] = useState("");

	console.log({ messages })
	console.log({ sendMessages })
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const wsRef = useRef();
	const scrollToTarget = useRef(null);

	const sendToServer = () => {
		if (sendMessages === "") return;
		wsRef.current.send(JSON.stringify({ sender: name, body: sendMessages }))
		setSendMessages("");
	}


	useEffect(() => {
		wsRef.current = new WebSocket("ws://localhost:8081");


		wsRef.current.onopen = () => {
			console.log("Conneection open now!!");
			setIsConnectionOpen((prev) => !prev)
		}

		wsRef.current.onmessage = (event) => {
			const message = JSON.parse(event.data);
			setMessages((_messages) => [..._messages, message]);
		}



		wsRef.current.onclose = (event) => {
			if (event.code === 4000) {
				navigate('/kicked', { state: { kickReason: event.reason } })
			}
		}
		return () => {
			console.log("clean up");
			wsRef.current.close();
		}
	}, [])


	useEffect(()=>{
		if(scrollToTarget.current){
			scrollToTarget.current.scrollIntoView({behavior: 'smooth'})
			
		}
	},[messages.length])


	return (
		<main className='chat-wrapper'>
			<header className='chat-header'>
				<h1>WebSocket chat room</h1>
			</header>

			<div className='chat-view-container'>

				{messages.map((message) => (
					<article key={message.sentAt} className={'message-container' + (message.sender === name ? " own-message" : "")}>
						<header className='message-header'>
							<h4 className='message-sender'>{message.sender === name ? "You" : message.sender}</h4>
							<span className='message-time'>
								{new Date(message.sentAt).toLocaleTimeString(undefined, { timeStyle: "short" })}
							</span>
						</header>
						<p className='message-body'>{message.body}</p>

					</article>
				))}

               <div ref={scrollToTarget}></div>
			</div>

			<footer className='message-input-container'>
				<p className='chatting-as'>You are chatting as “{name}”</p>

				<div className='message-input-container-inner'>
					<input
						autoFocus
						aria-label='Type a message'
						placeholder='Type a message'
						type='text'
						autoComplete='off'
						value={sendMessages}
						onChange={(e) => setSendMessages(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") sendToServer();
						}}
					/>

					<button
						aria-label='Send'
						className='icon-button'
						onClick={sendToServer}
						disabled={!isConnectionOpen}
					>
						{sendIcon}

					</button>
				</div>
			</footer>
		</main>
	);
};
