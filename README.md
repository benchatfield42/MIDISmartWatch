The goal of this project is to use the accelerometer data from a smart watch to control a synthesised web output.

Low latency is important for musical expression and I am aiming for 10 to 15ms which I have been able to achieve using UDP. HTTP gave me latencies around 35ms locally and 400ms when sent to AWS. Using UDP there is no difference when sending to AWS as it maintained the low latency because there is no need for a response. Unfortunately I found that sending UDP at a rate of 10 to 15ms overwhelms the AWS server with my current configurations, but by limiting my latency to 30ms I was able to recieve data without being throttled. At 30ms there is also no fluctuations in the latency rate.

![image](https://github.com/user-attachments/assets/b4f17029-b728-426f-adb4-05e5f9d9b2e5)

![image](https://github.com/user-attachments/assets/181c7d6a-a148-4620-9193-718a8b03ec71)

![image](https://github.com/user-attachments/assets/6911817a-3bd2-4631-82bd-4b9270ef570c)

To activate web audio:

'chrome.exe --autoplay-policy=no-user-gesture-required'
