The goal of this project is to use the accelerometer data from an ESP32-S3 smart watch (T-Watch-S3) to control a synthesised web output. It lets you select 8 directions depending on the x and y values of the accelerometer, and each direction you tilt to plays a different note. When a second watch is connected it allows you to change the set of notes that will be played depending on direction. 

Instructions:

1) Create AWS instance and open port 8080 for all ipv4. This will allow for the watch to send data to the server.
2) sudo apt-get update
3) sudo apt-get install node.js npm
4) npm install cors express
5) Clone this repository
6) If you are using one watch, flash it with 8wayMidiaccel1.4.ino and run server.js. If you use two watches flash 8wayMidiaccel1.5 and run server2.js.
  (Note when flashing you must enter your WIFI and AWS server public IP. If you flash 2 watches you must also change the deviceID from 1 to 2 for the second watch)
7) Enter your AWS public IP + :8080 into your browser and you are ready to go.

![IMG_9144](https://github.com/user-attachments/assets/5b98ca3b-22ad-4628-bdb1-9fee20e3dd26)

Notes:

Low latency is important for musical expression and I am aiming for 10 to 15ms which I have been able to achieve using UDP. HTTP gave me latencies around 35ms locally and 400ms when sent to AWS. Using UDP there is no difference when sending to AWS as it maintained the low latency because there is no need for a response. Unfortunately I found that sending UDP at a rate of 10 to 15ms overwhelms the AWS server with my current configurations, but by limiting my latency to 30ms I was able to recieve data without being throttled. At 30ms there is also no fluctuations in the latency rate. 
Using Websockets I have been able to consistantly stay under 15ms even while using 2 watches at the same time on the same port which is very promising. For the future I could like to expand this project to use web BLE, which will eliminate the need to flash the watch every time you have a new AWS server or WIFI. 

![image](https://github.com/user-attachments/assets/b4f17029-b728-426f-adb4-05e5f9d9b2e5)

![image](https://github.com/user-attachments/assets/181c7d6a-a148-4620-9193-718a8b03ec71)

![image](https://github.com/user-attachments/assets/6911817a-3bd2-4631-82bd-4b9270ef570c)

To activate web audio (no longer needed):

`chrome.exe --autoplay-policy=no-user-gesture-required`
