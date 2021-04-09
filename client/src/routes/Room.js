import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import {
	FacebookShareButton,
	FacebookIcon,
	WhatsappShareButton,
	WhatsappIcon,
	EmailIcon,
	EmailShareButton,
} from 'react-share';

const Container = styled.div`
	display: grid;
	width: 900px;
	grid-gap: 10px;
	margin: auto;
	grid-template-columns: 1fr 1fr;
	align-item: center;
	@media (max-width: 450px) {
		display: grid;
		width: 310px;
		grid-gap: 3px;
		margin: auto;
		grid-template-columns: 1fr 1fr;
		align-item: center;
	}
`;

const Container2 = styled.div`
	width: 1000px;
	margin: auto;
	font-size: 10px;
	@media (max-width: 450px) {
		width: 310px;
		margin: auto;
		font-size: 7px;
	}
`;

const StyledVideo = styled.video`
	height: 300px;
	width: 450px;
	@media (max-width: 450px) {
		height: 150px;
		width: 150px;
	}
`;

const Video = (props) => {
	const ref = useRef();

	useEffect(() => {
		props.peer.on('stream', (stream) => {
			ref.current.srcObject = stream;
		});
	}, []);

	return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
	height: window.innerHeight / 2,
	width: window.innerWidth / 2,
};

const Room = (props) => {
	const [peers, setPeers] = useState([]);
	const [audio, setAudio] = useState(false);
	const [video, setVideo] = useState(true);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const roomID = props.match.params.roomID;

	useEffect(() => {
		socketRef.current = io.connect('/');
		navigator.mediaDevices.getUserMedia({ video: video, audio: audio }).then((stream) => {
			userVideo.current.srcObject = stream;
			socketRef.current.emit('join room', roomID);
			socketRef.current.on('all users', (users) => {
				const peers = [];
				users.forEach((userID) => {
					const peer = createPeer(userID, socketRef.current.id, stream);
					peersRef.current.push({
						peerID: userID,
						peer,
					});
					peers.push(peer);
				});
				setPeers(peers);
			});

			socketRef.current.on('user joined', (payload) => {
				const peer = addPeer(payload.signal, payload.callerID, stream);
				peersRef.current.push({
					peerID: payload.callerID,
					peer,
				});

				setPeers((users) => [...users, peer]);
			});

			socketRef.current.on('receiving returned signal', (payload) => {
				const item = peersRef.current.find((p) => p.peerID === payload.id);
				item.peer.signal(payload.signal);
			});
		});
	}, []);

	function createPeer(userToSignal, callerID, stream) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('sending signal', { userToSignal, callerID, signal });
		});

		return peer;
	}

	function addPeer(incomingSignal, callerID, stream) {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('returning signal', { signal, callerID });
		});

		peer.signal(incomingSignal);

		return peer;
	}

	return (
		<div>
			<Container2>
				<div>
					<h1
						style={{
							margin: '20px',
						}}
					>
						Share & Invite
					</h1>
					<h1
						style={{
							margin: '20px',
							border: 'solid black 2px',
							padding: '10px',
							color: 'grey',
						}}
					>
						{window.location.href}
					</h1>
					<div style={{ margin: '20px', display: 'flex', justifyContent: 'space-around', width: '200px' }}>
						<CopyToClipboard text={window.location.href}>
							<IconButton>
								<FileCopyIcon />
							</IconButton>
						</CopyToClipboard>
						<FacebookShareButton
							url={window.location.href}
							quote={'CampersTribe - World is yours to explore'}
						>
							<FacebookIcon round={true} size={36} />
						</FacebookShareButton>
						<WhatsappShareButton
							url={window.location.href}
							title={'Your friend is inviting you to join chat room, Click to join: '}
						>
							<WhatsappIcon round={true} size={36} />
						</WhatsappShareButton>
						<EmailShareButton
							url={window.location.href}
							subject={'Your friend is inviting you to join chat room, Click to join: '}
							body={'tap on link to join:  '}
						>
							<EmailIcon round={true} size={36} />
						</EmailShareButton>
					</div>
				</div>
			</Container2>
			<Container>
				<StyledVideo ref={userVideo} autoPlay playsInline />
				{peers.map((peer, index) => {
					return (
						<div>
							<Video key={index} peer={peer} />
						</div>
					);
				})}
			</Container>
			<div>
				<button onClick={() => setAudio(!audio)}>{audio ? 'unmute' : 'mute'}</button>
			</div>
			<div>
				<button onClick={() => setVideo(!video)}>{video ? 'stop video' : 'start video'}</button>
			</div>
		</div>
	);
};

export default Room;
