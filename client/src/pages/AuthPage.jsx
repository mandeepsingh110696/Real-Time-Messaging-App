import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';



export const AuthPage = () => {
	const navigate = useNavigate();
    const [name,setName] = useState("");
	const redirectToChat= ()=>{
		if(name!=="") navigate(`/chat/${name}`);
	}
	return (
		<main className='simple-wrapper'>
			<p className='simple-heading'>Hey there</p>

			<p id='name-label' className='simple-subhead'>
				What should your peers call you?
			</p>

			<div className='simple-section'>
				<input
					aria-labelledby='name-label'
					type='text'
					autoComplete='name'
					placeholder='Your name or nickname'
					value={name}
					onChange={(e)=>setName(e.target.value)}
					onKeyPress={(e)=> {
						if(e.key==="Enter")redirectToChat();
					}}
				/>
			</div>

			<div className='simple-section'>
				<button onClick={redirectToChat}>Start chatting</button>
			</div>
		</main>
	);
};
