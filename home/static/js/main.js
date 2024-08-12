console.log("Welocme to voice room");
const our_video = document.getElementById('ours');
const remote_video = document.getElementById("remote");
const call_btn = document.getElementById('call');

const dataContainer = document.getElementById('data-container');
const created = dataContainer.getAttribute('data-created');
const room = dataContainer.getAttribute('data-room');

console.log("Room:", room);
console.log("Created:", created);
let iceServers = {
    iceServers: [
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

let iscreated;

let stream;
let rtcpeerconnection;

let ws = new WebSocket('ws://' + window.location.host + '/ws/');
ws.onopen = () => {
        console.log("opened");
        ws.send(
          JSON.stringify({
            command: "join_room",
            room: room,
          })
        );
        if (created == "created") {
          isCreated = true;
          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .then((s) => {
              stream = s;
              our_video.srcObject = s;
              our_video.onloadeddata = () => {
                our_video.play();
              };
            });
          console.log(isCreated);
        } else {
          isCreated = false;
          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .then((s) => {
              stream = s;
              our_video.srcObject = s;
              our_video.onloadeddata = () => {
                our_video.play();
              };
              ws.send(
                JSON.stringify({
                  command: "join",
                  room: room,
                })
              );
            });
          console.log(isCreated);
        }
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data["command"] == "join") {
          if (isCreated) {
            call_btn.style.display = "block";
          }
        } else if (data["command"] == "offer") {
          if (isCreated == false) {
            createanswer(data["offer"]);
          }
        } else if (data["command"] == "answer") {
          if (isCreated) {
            rtcpeerconnection.setRemoteDescription(data["answer"]);
            console.log("answer set as remote");
          }
        } else if (data["command"] == "candidate") {
          if (data["iscreated"] != isCreated) {
            const IceCandidate = new RTCIceCandidate(data["candidate"]);
            rtcpeerconnection.addIceCandidate(IceCandidate);
          }
        }
      };
      call_btn.onclick = () => {
        createoffer();
      };
      function createoffer() {
        console.log("offer started");
        rtcpeerconnection = new RTCPeerConnection(iceServers);
        rtcpeerconnection.onicecandidate = OnIceCandidateFunc;
        rtcpeerconnection.ontrack = OnTrackFunc;
        stream.getTracks().forEach((track) => {
          rtcpeerconnection.addTrack(track, stream);
        });
        rtcpeerconnection.createOffer().then((offer) => {
          rtcpeerconnection.setLocalDescription(offer);
          ws.send(
            JSON.stringify({
              command: "offer",
              offer: offer,
              room: room,
            })
          );
        });
      }
      function createanswer(offer) {
        console.log("answer started");
        rtcpeerconnection = new RTCPeerConnection(iceServers);
        rtcpeerconnection.onicecandidate = OnIceCandidateFunc;
        rtcpeerconnection.ontrack = OnTrackFunc;
        stream.getTracks().forEach((track) => {
          rtcpeerconnection.addTrack(track, stream);
        });
        rtcpeerconnection.setRemoteDescription(offer);
        rtcpeerconnection.createAnswer().then((answer) => {
          rtcpeerconnection.setLocalDescription(answer);
          ws.send(
            JSON.stringify({
              command: "answer",
              answer: answer,
              room: room,
            })
          );
        });
      }
      function OnIceCandidateFunc(e) {
        if (e.candidate) {
          ws.send(
            JSON.stringify({
              command: "candidate",
              candidate: e.candidate,
              iscreated: isCreated,
              room: room,
            })
          );
        }
      }
      function OnTrackFunc(e) {
        remote_video.srcObject = e.streams[0];
        remote_video.onloadedmetadata = () => {
          remote_video.play();
        };
      }